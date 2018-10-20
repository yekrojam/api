const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const methodOverride = require('method-override');
const restify = require('express-restify-mongoose');

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
  cors(), // Enable cors for all requests
  helmet(),
  compression(),
  router,
  (req, res) => {
    res.status(404).json({ message: http.STATUS_CODES[404] });
  },
);

// TODO: add error handler so errors thrown by the middleware get handled nicely

module.exports = app;
