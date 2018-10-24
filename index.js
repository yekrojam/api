const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const methodOverride = require('method-override');
const jwt = require('express-jwt');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const devTokenHandler = require('./middleware/devTokenHandler');

const v1Router = require('./v1');
const v2Router = require('./v2');

// Verify that the env has everything we need to get started. Fail fast if not
require('./utils/envVerification').verify();
require('./utils/connectMongoose')();

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
  v1Router,
  v2Router,
  notFound,
  errorHandler,
);

module.exports = app;
