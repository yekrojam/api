
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const restify = require('express-restify-mongoose');
const compression = require('compression');
const helmet = require('helmet');
const http = require('http');
const jwt = require('express-jwt');
const restifyOptions = require('./utils/restifyOptions');

// Verify that the env has everything we need to get started. Fail fast if not
require('./utils/envVerification').verify();
require('./utils/connectMongoose')();

const Org = require('./orgModel');
const User = require('./userModel');
const Membership = require('./membershipModel');

const router = express.Router();
restify.serve(router, Org, restifyOptions);
restify.serve(router, User, restifyOptions);
restify.serve(router, Membership, restifyOptions);

const app = express();
app.use(
  '/api',
  methodOverride(),
  bodyParser.json(),
  helmet(),
  compression(),
  jwt({
    credentialsRequired: process.env.NODE_ENV === 'production',
    secret: process.env.JWT_SECRET,
  }),
  router,
  (req, res) => {
    res.status(404).json({ message: http.STATUS_CODES[404] });
  },
);

// TODO: add error handler so errors thrown by the middleware get handled nicely

module.exports = app;
