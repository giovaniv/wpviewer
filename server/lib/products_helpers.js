"use strict";

let request = require('request');
let request_promise = require('request-promise');

// Defines helper functions for products routers
module.exports = {

  // Function to prepare the category object
  prepareCategories: function(list) {
    let result = [];
    list.forEach((key)=>{
      let myCategory = {
        id: key.id,
        name: key.name,
        total: 0
      }
      result.push(myCategory)
    })
    return result
  },

  // Function that make a http-request to the Walmart Taxonomy API
  // and after get all the categories we call the prepareCategories function
  // to create the categoryList object as we need and return as a promise for us
  getAllCategoriesPromise: function() {
    let myUrl = process.env.WALMART_TAXONOMY + 'apiKey=' + process.env.WALMART_KEY;
    return new Promise(function(resolve, reject) {
      request_promise({
        "method":"GET", 
        "uri": myUrl,
        "json": true,
        "headers": {
          "User-Agent": "wpviewer"
        }
      })
      .then(body=>{
        let objCategories = body.categories;
        let myCategories = module.exports.prepareCategories(objCategories);
        resolve(myCategories);
      })
      .catch(err=> {
        reject(err)
      });
    });
  },

  // Function that get the Promise of Taxonomy API http-request
  // and send it back as a callback to be call before/after anytime
  getAllCategories: function(myPromise,cb) {
    let myCategories = '';
    myPromise
    .then((result)=>{
      myCategories = result
      cb(myCategories)
    })
    .catch((err)=>{
      myCategories = err
      cb(myCategories)
    })
  },

  // Function to prepare the pagination for both cases (Pagination and Search API)
  preparePagination: function(list, numItems, categoryName, categoryId, last, curr, next, myStep, firstId) {

    // We guarantee that we will get the first page when
    // we are doing the pagination using PAGINATION API
    let myFirstId = 0;
    if (!list.maxId && list.nextPage) {
      myFirstId = list.nextPage.split('&')[1].split('=')[1];
    } else {
      myFirstId = firstId;
    }

    let myPagination = {

      // Pagination API parameters
      totalPages: list.totalPages ? list.totalPages : 0,
      maxId: list.maxId ? list.maxId : 0,
      nextPage: list.nextPage ? list.nextPage : 0,

      // Search API parameters
      query: list.query ? list.query : '',
      totalResults: list.totalResults ? list.totalResults : 0,
      start: list.start ? list.start : 0,
      numItems: numItems,

      // Pagination control-flow
      firstId: myFirstId,
      lastId: 0,
      currId: 0,
      nextId: list.nextPage ? list.nextPage.split('&')[1].split('=')[1] : 0,
      
      // Others important values
      records: 0,
      category: list.category ? list.category : categoryId,
      categoryName: categoryName

    }

    // We calculate the total of records for pagination or search API
    if (myPagination.totalPages) {
      myPagination.records = myPagination.totalPages * numItems;
    } else {
      myPagination.records = myPagination.totalResults;
    }

    // If the information comes from Pagination API
    if (myPagination.nextPage) {

      if (myStep == 'right') {
        myPagination.lastId = last;
        myPagination.currId = curr;
      } else if (myStep == 'left') {

        console.log('lastId = ', myPagination.lastId);
        console.log('currId = ', myPagination.currId);
        console.log('nextId = ', myPagination.nextId);
        console.log('firstId = ', myPagination.firstId);
        console.log('--- MAXID ---', myPagination.maxId);
        console.log('lastId param = ', last);
        console.log('currId param = ', curr);
        console.log('nextId param = ', next);
        console.log('firstId param = ', firstId);

        myPagination.lastId = last;
        myPagination.currId = curr;
        myPagination.nextId = next;

      }

    // If the information comes from Search API
    } else {

      // If it's the first page
      if (parseInt(myPagination.start) === 1) {
        myPagination.lastId = 0;
        myPagination.currId = 1;
        myPagination.nextId = parseInt(myPagination.numItems) + 1;
      // If it's another page instead
      } else {
        // If we are going to the next page
        if (myStep == 'right') {
          myPagination.lastId = curr;
          myPagination.currId = next;
          myPagination.nextId = parseInt(myPagination.numItems) + parseInt(next);
        // If we are returning to a previous page
        } else if (myStep == 'left') {
          myPagination.lastId = last;
          myPagination.currId = curr;
          myPagination.nextId = next;
        }
      }

    }

    return myPagination

  },

  // Function to filter products by name
  filterProducts: function(filterString, list) {
    let regex = new RegExp(filterString,"i");
    let result = [];
    list.map((item)=>{
      if (item.name.includes(filterString) || regex.test(item.name) ) {
        result.push(item)
      }
    })
    return result;
  },

  // Function to get the name of the category by ID
  getCategoryName: function(categoryID, list) {
    let myName = '';
    list.forEach((key)=>{
      if (key.id.includes(categoryID)) {
        myName = key.name
      }
    })
    return myName;
  },

  // Function to get all the categories to display in the Home Product page
  // using the promise that we create in getAllCategoriesPromise function
  // and retrieved as a callback in getAllCategories function
  mountProductFirstPage: function(cb) {
    let searchCategories = module.exports.getAllCategoriesPromise();
    module.exports.getAllCategories(searchCategories,(categoryList)=>{
      if (categoryList) {
        return cb(null,categoryList);
      } else {
        return cb('Category not found');
      }
    });
  },

  // Function to get the products of a category in Walmart Open API
  getProducts: function(categoryID, queryString, numItems, lastId, currId, nextId, myStep, firstId, cb) {

    let myUrl = '';
    let myPosition = '';
    let myLast = '';
    let myCurr = '';
    let myNext = '';

    // myNumItems receive numItems if numItems is true
    // myNumItems receive 25 if numItems is false
    let myNumItems = numItems ? numItems : 25;

    // If we are calling this function passing a queryString
    // we need to use the SEARCH API for that and we deal with
    // it in a different way of when we use PAGINATION API
    if (queryString) {

      if (myStep) {
        if (myStep == 'right') {
          myLast = lastId;
          myCurr = currId;
          myNext = nextId;
          myPosition = '&start=' + myNext;
        } else if (myStep == 'left') {
          myNext = currId;
          myCurr = lastId;
          myLast = parseInt(lastId) - parseInt(myNumItems);
          if (myLast < 0) {
            myLast = 1;
          }
          myPosition = '&start=' + myLast;
        }
      } else {
        myLast = 0;
        myCurr = 1;
        myNext = parseInt(myNumItems) + 1;
      }

    // se vier da Pagination API
    } else {

      // Pagination control-flow
      //console.log('O COMECO DE TUDO E AQUI ===> ', lastId, currId, nextId, myStep);
      if (myStep) {
        // console.log('Hora de tomar alguma decisao com esses valores...');
        // console.log('first = ', firstId);
        // console.log('last = ', lastId);
        // console.log('curr = ', currId);
        // console.log('next = ', nextId);
        // console.log('myStep = ', myStep);

        if (myStep == 'right') {
          myNext = nextId;
          myCurr = nextId;
          myLast = currId;
          myPosition = '&maxId=' + myNext;
        } else {
          // console.log('=== RECEBEMOS ISSO COMO PARAMETRO ===');
          // console.log('first = ', firstId);
          // console.log('last = ', lastId);
          // console.log('curr = ', currId);
          // console.log('next = ', nextId);
          // console.log('myStep = ', myStep);
          myNext = currId;
          myCurr = lastId;
          myLast = lastId;
          myPosition = '&maxId=' + lastId;
          // console.log('=== DEPOIS DE SALVARMOS FICOU ASSIM ===');
          // console.log('first = ', firstId);
          // console.log('last = ', myLast);
          // console.log('curr = ', myCurr);
          // console.log('next = ', myNext);
          // console.log('myPosition = ', myPosition);
        }

        // console.log('=== vamos enviar isso para a paginacao ===');
        // console.log('first = ', firstId);
        // console.log('last = ', myLast);
        // console.log('curr = ', myCurr);
        // console.log('next = ', myNext);
        // console.log('myStep = ', myStep);

      }

    }

    console.log('=== DEPOIS DE SALVARMOS FICOU ASSIM ===');
    console.log('first = ', firstId);
    console.log('last = ', myLast);
    console.log('curr = ', myCurr);
    console.log('next = ', myNext);
    console.log('myStep = ', myStep);
    console.log('myPosition = ', myPosition);

    // Pagination API == queryString optional, up to 1.000 products per time, search only products result
    // Search API ====== queryString required, up to 25 products per time, search all products everytime
    if (queryString) {
      myUrl = process.env.WALMART_SEARCH + 'apiKey=' + process.env.WALMART_KEY;
      myUrl += '&categoryId=' + categoryID + '&numItems=' + myNumItems + '&query=' + queryString + myPosition;
    } else {
      myUrl = process.env.WALMART_PAGINATED + 'apiKey=' + process.env.WALMART_KEY;
      myUrl += '&category=' + categoryID + '&count=' + myNumItems + myPosition;
    }

    console.log('URL ========> ', myUrl)

    // First we get all the categories to mount the CategoryList combobox
    let searchCategories = module.exports.getAllCategoriesPromise();
    module.exports.getAllCategories(searchCategories,(categoryList)=>{

      // We get the name of the current category
      let categoryName = module.exports.getCategoryName(categoryID, categoryList);

      // We made a http-request promise to get the products in Search or Pagination API
      request_promise({
        "method":"GET", 
        "uri": myUrl,
        "json": true,
        "headers": {
          "User-Agent": "wpviewer"
        }
      })
      .then(body=>{
        let pagination = module.exports.preparePagination(body, myNumItems, categoryName, categoryID, myLast, myCurr, myNext, myStep, firstId);
        let myProducts = body.items;
        let total = pagination.records;
        return cb(null,myProducts, pagination, categoryList, total);
        
        // if (queryString) {
        //   myProducts = module.exports.filterProducts(queryString, body.items);
        // } else {
        //   myProducts = body.items;
        // }
        //console.log('vamos ver se temos = ', pagination.nextPage)
        // if (myProducts) {
        //   console.log('myProducts AQUI ===> ', myProducts.length);
        //   // console.log('body AQUI ===> ', body.totalResults);
        //   return cb(null,myProducts, pagination, categoryList);
        // } else {
        //   cb('No products for this category OR category not found');
        // }
      })
      .catch(err=> {
        cb('Error requesting API');
      });

    });

  }

}

