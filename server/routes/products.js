"use strict";

const express         = require('express');
const productsRoutes  = express.Router();

module.exports = function(DataHelpers) {

  // route when we go to URL localhost:port/products same function as POST route but
  // without filter so we show the first 25 products of the product API list and
  // if we have a category ID will be because 
  productsRoutes.get("/", function(req, res) {

    // Category ID filter when we click in a category
    let myCategoryID = '';
    if (req.query.category) {
      myCategoryID = req.query.category
    }

    DataHelpers.getProductsByCategory(myCategoryID,null,(err,products, pagination) => {
      if (err) {
        res.status(201).send(err);
      } else {
        res.status(201).render('products',{ products, pagination, total: products.length })
      }
    });
  });

  // route when we filter for some product name using the SEARCH button in product page
  // POST because we don't want to show the queryString in the address bar as a security reason
  productsRoutes.post("/", function(req, res) {

    // Category ID filter
    let myCategoryID = '';
    if (req.body.category) {
      myCategoryID = req.body.category
    }

    // Product name filter
    let productName = '';
    if (req.body.productName) {
      productName = req.body.productName
    }

    // We go to the backend asking for this products, filtered or not
    // and we send it back to the client side, rendering the products.ejs page
    DataHelpers.getProductsByCategory(myCategoryID,productName,(err,products, pagination) => {
      if (err) {
        res.status(201).send(err);
      } else {
        res.status(201).render('products',{ products, pagination, total: products.length })
      }
    });
  });

  return productsRoutes;

}
