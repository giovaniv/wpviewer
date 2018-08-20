"use strict";

let request = require('request');
let request_promise = require('request-promise');

// Defines helper functions for categories area
//module.exports = function makeDataHelpers() {
module.exports = {

    getTotalProductsByCategory: function(category_id) {
      let myTotal = 0;
      let myUrl = process.env.WALMART_PAGINATED + 'category=' + category_id;
      myUrl += '&apiKey=' + process.env.WALMART_KEY + '&count=1';
      // request.get({ url: myUrl }, function(err, resp, body) {
      //   if (!err && resp.statusCode == 200) {
      //     myTotal = JSON.parse(body).totalPages;
      //   }
      // });
      // return myTotal;
      return request_promise({
        "method":"GET", 
        "uri": myUrl,
        "json": true,
        "headers": {
          "User-Agent": "wpviewer"
        }
      })
      .then(body=>{
        //console.log(body.totalPages)
        myTotal = body.totalPages;
        return myTotal;
        //console.log(body)
        //console.log(JSON.parse(body))
      })
      .catch(err=>{
        return myTotal;
      })
      //console.log('resultado: ', myTotal)
    },

    prepareCategories: function(list) {
      let result = [];
      list.forEach((key)=>{
        //console.log(key.id, key.name)
        //let teste = 0;
        let myCategory = {
          id: key.id,
          name: key.name,
          total: 0
        }
        //let myTotal = Promise.resolve(module.exports.getTotalProductsByCategory(key.id))
        //console.log('resultado: ', myTotal)
        //myTotal.then((totalProducts) => {
          //console.log('total: ', content);
          //console.log('myCategory.total: ', myCategory.total);
          //teste = totalProducts;
          //myCategory.total = totalProducts;
          //console.log(myCategory)
          //result.push(myCategory)
        //})
        //.catch(err=>{
          //result.push(myCategory)
        //})
        //console.log(teste)
        result.push(myCategory)
      })
      return result
    },

    // Function to filter categories by name
    filterCategories: function(filterString, list) {
      let regex = new RegExp(filterString,"i");
      let result = [];
      list.map((item)=>{
        if (item.name.includes(filterString) || regex.test(item.name) ) {
          result.push(item)
        }
      })
      return result;
    },

    // Function to retrieve the categories in Walmart Open API
    getCategories: function(name, cb) {
      let myUrl = process.env.WALMART_TAXONOMY + 'apiKey=' + process.env.WALMART_KEY;
      request.get({ url: myUrl }, function(err, resp, body) {
        if (!err && resp.statusCode == 200) {
          let myData = JSON.parse(body);
          let objCategories = myData.categories;
          let categories = module.exports.prepareCategories(objCategories)
          let myCategories = [];
          // If there is a filter string, we get only the filtered categories by name
          if (name) {
            myCategories = module.exports.filterCategories(name, categories)
          } else {
            myCategories = categories
          }
          return cb(null,myCategories)
        }
      });

    }

}

