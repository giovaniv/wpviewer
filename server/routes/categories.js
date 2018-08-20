"use strict";

const express         = require('express');
const categoriesRoutes  = express.Router();

module.exports = function(DataHelpers) {

  // route when we go to URL localhost:port/categories
  categoriesRoutes.get("/", function(req, res) {

    // Check if the user try to filter for some category
    // and if it's true, we send this information to the backend
    let myName = '';
    if (req.query.categoryName) {
      myName = req.query.categoryName
    }

    // function that will get the categories in Walmart Open API
    // and display it in the frontend
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
