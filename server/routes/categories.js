"use strict";

const express         = require('express');
const categoriesRoutes  = express.Router();

module.exports = function(DataHelpers) {

  // route when we go to URL localhost:port/categories
  // same function as POST route but without filter so we show all the categories
  categoriesRoutes.get("/", function(req, res) {
    DataHelpers.getCategories(null,(err,result) => {
      if (err) {
        res.status(201).send(err);
      } else {
        res.status(201).render('categories',{ categories: result, total: result.length })
      }
    });
  });

  // route when we filter for some category name using the SEARCH button in category page
  // POST because we don't want to show the queryString in the address bar as a security reason
  categoriesRoutes.post("/", function(req, res) {

    // if the user filtered some category by name, we save this information
    let myName = '';
    if (req.body.categoryName) {
      myName = req.body.categoryName
    }

    // We go to the backend asking for this categories, filtered or not
    // and we send it back to the client side, rendering the categories.ejs page
    DataHelpers.getCategories(myName,(err,result) => {
      if (err) {
        res.status(201).send(err);
      } else {
        res.status(201).render('categories',{ categories: result, total: result.length })
      }
    });
  });

  return categoriesRoutes;

}
