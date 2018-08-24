"use strict";

const express = require('express');
const categoriesRoutes  = express.Router();

module.exports = function(DataHelpers) {

  // route to localhost:port/categories to get the
  // category list so we can filter the products after
  categoriesRoutes.get("/", function(req, res) {
    DataHelpers.getCategories(null,(err,result) => {
      if (err) {
        res.status(201).render('error',{ err });
      } else {
        res.status(201).render('categories',{ categories: result, total: result.length })
      }
    });
  });

  // route when we filter for some category using the Search
  categoriesRoutes.post("/", function(req, res) {
  
    // If the user search for some category we save it
    let myName = req.body.categoryName ? req.body.categoryName : '';

    DataHelpers.getCategories(myName,(err,result) => {
      if (err) {
        res.status(201).render('error',{ err });
      } else {
        res.status(201).render('categories',{ categories: result, total: result.length })
      }
    });
  });

  return categoriesRoutes;

}
