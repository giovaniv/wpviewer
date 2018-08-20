"use strict";

// dotenv npm package to loads environment variables
// from a .env file into process.env
require('dotenv').config();

// SERVER CONSTS
const IP = '0.0.0.0';
//process.env.PORT in case of deployment (Heroku, DigitalOcean or other)
const PORT = process.env.PORT || 7000;
//const ENV = process.env.ENV || "development";

// LOAD NPM PACKAGES
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');

// KNEX SETUP
//const knexConfig = require("../knexfile");
//const knex = require("knex")(knexConfig[ENV]);

// SETUP OF EXPRESS APP and EJS as our VIEW ENGINE
const app = express();
app.set("view engine", "ejs");

// MIDDLEWARES
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(knexLogger(knex));

// DATAHELPERS
// const api_helpers = require("./lib/api_helpers.js")(knex);
// const products_helpers = require("./lib/products_helpers.js")(knex);
// const prices_helpers = require("./lib/prices_helpers.js")(knex);
// const stores_helpers = require("./lib/stores_helpers.js")(knex);
// const categories_helpers = require("./lib/categories_helpers.js")(knex);
// const users_helpers = require("./lib/users_helpers.js")(knex);
// const lists_helpers = require("./lib/lists_helpers.js")(knex);
// const maps_helpers = require("./lib/maps_helpers.js")(knex);
const categories_helpers = require("./lib/categories_helpers.js");

// ROUTES
// const apiRoutes = require('./routes/apis')(api_helpers);
// const productsRoutes = require('./routes/products')(products_helpers);
// const pricesRoutes = require('./routes/prices')(prices_helpers);
// const storesRoutes = require('./routes/stores')(stores_helpers);
// const categoriesRoutes = require('./routes/categories')(categories_helpers);
// const usersRoutes = require('./routes/users')(users_helpers);
// const listsRoutes = require('./routes/lists')(lists_helpers);
// const MapsRoutes = require('./routes/maps')(maps_helpers);
const categoriesRoutes = require('./routes/categories')(categories_helpers);

// MOUNTS
// app.use('/apis', apiRoutes)
// app.use('/products', productsRoutes);
// app.use('/prices', pricesRoutes);
// app.use('/stores', storesRoutes);
// app.use('/categories', categoriesRoutes);
// app.use('/users', usersRoutes);
// app.use('/lists', listsRoutes);
// app.use('/maps', MapsRoutes);
app.use('/categories', categoriesRoutes);

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => { res.render("index") });
//app.get("/categories", (req, res) => { res.render("categories") });
app.get("/products", (req, res) => { res.render("products") });
app.get("/features", (req, res) => { res.render("features") });
app.get("/about", (req, res) => { res.render("about") });

app.listen(PORT, IP, () => {
  console.log("Example app listening on port " + PORT)
});
