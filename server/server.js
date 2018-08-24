"use strict";

// dotenv npm package to loads environment variables
// from a .env file into process.env
require('dotenv').config();

// SERVER CONSTS
const IP = '0.0.0.0';
//process.env.PORT in case of deployment (Heroku, DigitalOcean or other)
const PORT = process.env.PORT || 7000;

// LOAD NPM PACKAGES
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');

// SETUP OF EXPRESS APP and EJS as our VIEW ENGINE
const app = express();
app.set("view engine", "ejs");
app.use('*/css',express.static(__dirname + '/public/css'));
app.use('*/imgs',express.static(__dirname + '/public/imgs'));

// MIDDLEWARES
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

// DATAHELPERS
const categories_helpers = require("./lib/categories_helpers.js");
const products_helpers = require("./lib/products_helpers.js");

// ROUTES
const categoriesRoutes = require('./routes/categories')(categories_helpers);
const productsRoutes = require('./routes/products')(products_helpers);

// MOUNTS
app.use('/categories', categoriesRoutes);
app.use('/products', productsRoutes);
app.get("/", (req, res) => { res.render("index") });
app.get("/about", (req, res) => { res.render("about") });
app.get('*', (req, res) => { res.render("404") });

// SERVER RUNNING WHEN WE USE COMMAND 'NPM RUN SERVER'
app.listen(PORT, IP, () => {
  console.log("Example app listening on port " + PORT)
});
