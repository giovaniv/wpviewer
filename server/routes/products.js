"use strict";

// pagination variables
let numItems = '';
let myCategoryID = '';
let productName = '';
let next = '';
let last = '';
let curr = '';
let myStep = '';
let first = '';
let myQuery = '';

const express = require('express');
const productsRoutes  = express.Router();

module.exports = function(DataHelpers) {

  // route when we go to URL localhost:port/products and the user didn't selected
  // any category to display. We go to the backend, get all categories and display
  // the categoryList combobox, the search field and a welcome text
  productsRoutes.get("/", function(req, res) {
    DataHelpers.mountProductFirstPage((err,categoryList) => {
      if (err) {
        res.status(201).render('error',{ err });
      } else {
        res.status(201).render('products_home',{ categoryList });
      }
    });
  });

  // Route when the user clicks in any category in the category list at category main page
  productsRoutes.get("/category/:id", function(req, res) {
    let myCategoryID = req.params.id ? req.params.id : 0; 
    if (!myCategoryID || myCategoryID === 0) {
      res.status(201).render('error', { err: 'A valid category needs to be selected' });
    }
    DataHelpers.getProducts(myCategoryID, null, null, 0, 0, 0, null, null, 
      (err,products, pagination, categoryList, total) => {
      if (err) {
        res.status(201).render('error',{ err });
      } else {
        res.status(201).render('products',{ products, pagination, categoryList, total });
      }
    });
  });

  // Route to do the pagination using PAGINATION API
  productsRoutes.get('/category/:id/page', function(req,res) {
    myCategoryID = req.params.id;
    numItems = req.query.num;
    last = req.query.last;
    curr = req.query.curr;
    next = req.query.next;
    myStep = req.query.step;
    first = req.query.first;
    DataHelpers.getProducts(myCategoryID, null, numItems, last, curr, next, myStep, first, 
      (err,products, pagination, categoryList, total) => {
      if (err) {
        res.status(201).render('error',{ err });
      } else {
        res.status(201).render('products',{ products, pagination, categoryList, total });
      }
    });
  });

  // Route to do the pagination using SEARCH API
  productsRoutes.get('/search', function(req,res) {
    myCategoryID = req.query.id;
    numItems = req.query.num;
    last = req.query.last;
    curr = req.query.curr;
    next = req.query.next;
    myStep = req.query.step;
    first = req.query.first;
    myQuery = req.query.q;
    DataHelpers.getProducts(myCategoryID, myQuery, numItems, last, curr, next, myStep, first, 
      (err,products, pagination, categoryList, total) => {
      if (err) {
        res.status(201).render('error',{ err });
      } else {
        res.status(201).render('products',{ products, pagination, categoryList, total });
      }
    });
  });

  // route when we filter for some product name using the SEARCH button in product page
  // POST because we don't want to show the queryString in the address bar as a security reason
  productsRoutes.post("/", function(req, res) {

    // Category ID filter and if the user doesn't select any
    // category we return to the page showing an alert about it
    if (req.body.categorySelect != 0) {
      myCategoryID = req.body.categorySelect;
    } else {
      DataHelpers.mountProductFirstPage((err,categoryList) => {
        if (err) {
          res.status(201).render('error',{ err });
        } else {
          res.status(201).render('products_home',{ categoryList, msg: 'Please select any category' });
        }
      });
      return;
    }

    // Product Name filter
    productName = req.body.productName;

    // Number of Items per page filter
    if (req.body.numSelect) {
      numItems = req.body.numSelect;
    }

    // We go to the backend asking for this products, filtered or not
    // and we send it back to the client side, rendering the products.ejs page
    DataHelpers.getProducts(myCategoryID, productName, numItems, null, null, null, null, null, 
      (err,products, pagination, categoryList, total) => {
      if (err) {
        res.status(201).render('error',{ err });
      } else {
        res.status(201).render('products',{ products, pagination, categoryList, total });
      }
    });
  });

  return productsRoutes;

}
