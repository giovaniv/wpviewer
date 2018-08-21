"use strict";

let request = require('request');
let request_promise = require('request-promise');

// Defines helper functions for products routers
module.exports = {

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

  // Function to get the products of a category in Walmart Open API
  getProductsByCategory: function(category, name, cb) {
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

        return cb(null, myProducts, pagination)
      }
    });

  }

}

