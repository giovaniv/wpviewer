"use strict";

let request = require('request');

module.exports = {

  // Function to prepare the categories object with
  // all the information that we need to show.
  // If I have time, improve it inserting the children categories
  // and the total of products of each category
  prepareCategories: function(list) {
    let result = [];
    list.forEach((key)=>{
      let myCategory = {
        id: key.id,
        name: key.name,
        total: 0
      }
      result.push(myCategory);
    })
    return result;
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
      // and the filterCategories function is only called when the client type
      // something in the text field and click on the SEARCH button
      if (!err && resp.statusCode == 200) {
        let myData = JSON.parse(body);
        let objCategories = myData.categories;
        let categories = module.exports.prepareCategories(objCategories);
        let myCategories = [];
        if (name) {
          myCategories = module.exports.filterCategories(name, categories);
        } else {
          myCategories = categories;
        }
        return cb(null,myCategories);
      } else {
        return cb('Error requesting Taxonomy API');
      }

    });

  }

}

