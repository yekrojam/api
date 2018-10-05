const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const methodOverride = require('method-override');
const restify = require('express-restify-mongoose');
const jwt = require('express-jwt');

const restifyOptions = require('./utils/restifyOptions');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const devTokenHandler = require('./middleware/devTokenHandler');

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
  devTokenHandler,
  jwt({ secret: process.env.JWT_SECRET }).unless(req => !!req.user),
  router,
  notFound,
  errorHandler,
);

module.exports = app;
