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

  // Function to get the information for product pagination
  preparePagination: function(list, numItems, categoryName, categoryId, last, curr, next, myStep, firstId) {

    // Garantimos que temos o primeiro id para retornar para a primeira pagina em algum momento
    let myFirstId = 0;
    if (!list.maxId) {
      myFirstId = list.nextPage.split('&')[1].split('=')[1];
    } else {
      myFirstId = firstId;
    }

    let myPagination = {

      totalPages: list.totalPages ? list.totalPages : 0,
      maxId: list.maxId ? list.maxId : 0,
      nextPage: list.nextPage ? list.nextPage : 0,
      
      // ---- pagination control flow
      firstId: myFirstId,
      lastId: 0,
      currId: 0,
      nextId: list.nextPage.split('&')[1].split('=')[1],
      // --------------------------

      category: list.category ? list.category : categoryId,
      totalResults: list.totalResults ? list.totalResults : 0,
      start: list.start ? list.start : 0,
      query: list.query ? list.query : '',
      records: 0,
      numItems: numItems,
      categoryName: categoryName

    }

    // We calculate the total of records for pagination or search API
    if (myPagination.totalPages) {
      myPagination.records = myPagination.totalPages * numItems;
    } else {
      myPagination.records = myPagination.totalResults;
    }

    // console.log('=== parametros recebidos pelo objeto de paginacao ===');
    // console.log('lastId = ', last);
    // console.log('currId = ', curr);
    // console.log('nextId = ', next);
    // console.log('myStep = ', myStep);
    // console.log('MAXID AGORA => ', myPagination.maxId);

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

      // if (myStep == 'right') {
      //   myPagination.lastId = last;
      //   myPagination.currId = curr;
      // } else if (myStep == 'left') {
      //   console.log('TODO - objeto de paginacao para previous page')
      //   console.log('=== objeto de paginacao atual ===');
      //   console.log('lastId = ', myPagination.lastId);
      //   console.log('currId = ', myPagination.currId);
      //   console.log('nextId = ', myPagination.nextId);
      //   console.log('--- MAXID ---', myPagination.maxId);
      //   myPagination.lastId = last;
      //   myPagination.currId = curr;
      //   myPagination.nextId = next;
      // }

    // If the information comes from Search API
    } else {
      console.log('TODO - paginacao quando usamos Search API')
    }

    // console.log('=== objeto de paginacao que sera retornado ===');
    // console.log('lastId = ', myPagination.lastId);
    // console.log('currId = ', myPagination.currId);
    // console.log('nextId = ', myPagination.nextId);
    // console.log('firstId = ', myPagination.firstId);

    return myPagination

  },

  // Function to filter products by name
  filterProducts: function(filterString, list) {
    let regex = new RegExp(filterString,"i");
    let result = [];
    let count = 0;
    list.map((item)=>{
      count++;
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

    // Pagination API == queryString optional, up to 1.000 products per time, search only products result
    // Search API ====== queryString required, up to 25 products per time, search all products everytime
    if (queryString) {
      myUrl = process.env.WALMART_SEARCH + 'apiKey=' + process.env.WALMART_KEY;
      myUrl += '&categoryId=' + categoryID + '&numItems=' + myNumItems + '&query=' + queryString;
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

      // // And after that we get our products
      // // let myUrl = process.env.WALMART_PAGINATED + 'apiKey=' + process.env.WALMART_KEY;
      // // myUrl += '&category=' + category + '&count=100'
      // request.get({ url: myUrl }, function(err, resp, body) {
      //   if (!err && resp.statusCode == 200) {
      //     let myData = JSON.parse(body);
      //     let objProducts = myData.items;
      //     console.log(objProducts.length)
      //     let pagination = module.exports.preparePagination(myData, numItems, nameCurrentCategory, category, myUrl)
  
      //     // If there's a product name to filter, we do it
      //     // if don't, we use the objProducts itself
      //     let myProducts = [];
      //     if (name) {
      //       myProducts = module.exports.filterProducts(name, objProducts)
      //     } else {
      //       myProducts = objProducts
      //     }

      //     if (myProducts) {
      //       //return cb(null,myProducts, pagination, categoryList, nameCurrentCategory, name)
      //       return cb(null,myProducts, pagination, categoryList)
      //     } else {
      //       cb('No products for this category OR category not found')
      //     }
      //   } else {
      //     cb('Error requesting API')
      //   }
      // });

    });

  }

}

