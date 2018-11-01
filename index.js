const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const methodOverride = require('method-override');
const Sentry = require('@sentry/node');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const loadMemberships = require('./middleware/loadMemberships');
const userFromToken = require('./middleware/userFromToken');

const v1Router = require('./v1');
const v2Router = require('./v2');

// Verify that the env has everything we need to get started. Fail fast if not
require('./utils/envVerification').verify();
require('./utils/connectMongoose')();

const { SENTRY_DSN, NODE_ENV } = process.env;
if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, environment: NODE_ENV });
}

const app = express();

app.use(
  '/api',
  Sentry.Handlers.requestHandler(),
  methodOverride(),
  bodyParser.json(),
  cors(), // Enable cors for all requests
  helmet(),
  compression(),
  userFromToken,
  loadMemberships,
  v1Router,
  v2Router,
  notFound,
  errorHandler,
);

module.exports = app;
