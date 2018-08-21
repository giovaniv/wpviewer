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

  getAllCategoriesPromise: function() {
    let myUrl = process.env.WALMART_TAXONOMY + 'apiKey=' + process.env.WALMART_KEY;
    return new Promise(function(resolve, reject) {
      // request_promise.get(myUrl, function(err, resp, body) {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     let objCategories = JSON.parse(body).categories;
      //     let myCategories = module.exports.prepareCategories(objCategories);
      //     resolve(myCategories);
      //   }
      // })
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

  // // Function to get all categories of Walmart Open API
  // getAllCategories: function() {

  //   // The full URL can be checked in .ENV file. We use REQUEST package for get the API result
  //   let myUrl = process.env.WALMART_TAXONOMY + 'apiKey=' + process.env.WALMART_KEY;
  //   let myCategories = '';
  //   console.log('myCategories no inicio => ', myCategories)
  //   request.get({ url: myUrl }, function(err, resp, body) {
  //     if (err) {
  //       myCategories = err;
  //       console.log('myCategories quando deu erro => ', myCategories)
  //     }
  //     try {
  //       let myData = JSON.parse(body);
  //       let objCategories = myData.categories;
  //       myCategories = module.exports.prepareCategories(objCategories);
  //       console.log('myCategories IDEAL => ', myCategories)
  //     } catch(ex) {
  //       myCategories = ex;
  //       console.log('myCategories quando caiu na excessao => ', myCategories)
  //     }
  //   });
  //   console.log('myCategories que vai ser retornada => ', myCategories)
  //   return myCategories
  // },

  // Function to get the information for product pagination
  preparePagination: function(list) {
    let myPagination = {
      totalPages: list.totalPages ? list.totalPages : 0,
      maxId: list.maxId ? list.maxId : 0,
      nextPage: list.nextPage ? list.nextPage : 0,
      category: list.category ? list.category : 0
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

  getCategoryName: function(categoryID, list) {
    let myName = '';
    list.forEach((key)=>{
      if (key.id.includes(categoryID)) {
        myName = key.name
      }
    })
    return myName;
  },

  // Function to get the products of a category in Walmart Open API
  getProductsByCategory: function(category, name, cb) {

    // First we get the list of all categories to mount the form select when we return
    let searchCategories = module.exports.getAllCategoriesPromise();
    module.exports.getAllCategories(searchCategories,(categoryList)=>{

      // We get the name of the current category
      let nameCurrentCategory = module.exports.getCategoryName(category, categoryList);

      // And after that we get our products
      let myUrl = process.env.WALMART_PAGINATED + 'apiKey=' + process.env.WALMART_KEY;
      myUrl += '&category=' + category + '&count=25'
      request.get({ url: myUrl }, function(err, resp, body) {
        if (!err && resp.statusCode == 200) {
          let myData = JSON.parse(body);
          let objProducts = myData.items;
          let pagination = module.exports.preparePagination(myData)
  
          // If there's a product name to filter, we do it
          // if don't, we use the objProducts itself
          let myProducts = [];
          if (name) {
            myProducts = module.exports.filterProducts(name, objProducts)
          } else {
            myProducts = objProducts
          }
          if (myProducts) {
            return cb(null,myProducts, pagination, categoryList, nameCurrentCategory)
          } else {
            cb('No products for this category OR category not found')
          }
        } else {
          cb('Error requesting API')
        }
      });

    });


    // let myUrl = process.env.WALMART_PAGINATED + 'apiKey=' + process.env.WALMART_KEY;
    // myUrl += '&category=' + category + '&count=25'
    // request.get({ url: myUrl }, function(err, resp, body) {
    //   if (!err && resp.statusCode == 200) {
    //     let myData = JSON.parse(body);
    //     let objProducts = myData.items;
    //     let pagination = module.exports.preparePagination(myData)

    //     // If there's a product name to filter, we do it
    //     // if don't, we use the objProducts itself
    //     let myProducts = [];
    //     if (name) {
    //       myProducts = module.exports.filterProducts(name, objProducts)
    //     } else {
    //       myProducts = objProducts
    //     }
    //     if (myProducts) {
    //       return cb(null,myProducts, pagination)
    //     } else {
    //       cb('No products for this category OR category not found')
    //     }
    //   } else {
    //     cb('Error requesting API')
    //   }
    // });

  }

}

