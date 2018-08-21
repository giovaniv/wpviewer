"use strict";

let request = require('request');
let request_promise = require('request-promise');

module.exports = {

  // Function to get the total of products of each category
  // NOT USED UNTIL NOW BECAUSE I NEED TO CHECK THE REQUEST_PROMISE ISSUE
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

  // Function to prepare the categories object with
  // all the information that we need to show.
  // I only check for the main category and avoid the
  // children categories until now.
  // Maybe a future improvement if I have time.
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

  // Function to get all the categories in Walmart Open API by default
  // and filter by category name if the client side use the SEARCH button
  getCategories: function(name, cb) {

    // The full URL can be checked in .ENV file. We use REQUEST package for get the API result
    let myUrl = process.env.WALMART_TAXONOMY + 'apiKey=' + process.env.WALMART_KEY;
    request.get({ url: myUrl }, function(err, resp, body) {

      // If we don't have an error we handle the API content using the
      // prepareCategories function to create the category object that we need
      // and the filterCategories function is only called when the client typed
      // something in the text field and click in the SEARCH button
      if (!err && resp.statusCode == 200) {
        let myData = JSON.parse(body);
        let objCategories = myData.categories;
        let categories = module.exports.prepareCategories(objCategories)
        let myCategories = [];
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

