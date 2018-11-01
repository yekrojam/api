const _ = require('lodash');
const Sentry = require('@sentry/node');
const debug = require('debug')('majorkey2api');

function errorFormatter(err, req, res, next) { // eslint-disable-line no-unused-vars
  debug(err);

  const status = _.get(req, 'erm.statusCode', 400);
  let errorToShow = { message: err.message };

  if (err.name === 'ValidationError') {
    // Send back details to the client so they can intelligently tell the user what's up
    errorToShow = {
      message: err._message, // eslint-disable-line no-underscore-dangle
      name: err.name,
      errors: _.mapValues(err.errors, 'message'),
    };
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(errorToShow);
}

// Call the sentry error handler and our own. The bundle them together like this so
// it unit can be easily used in multiple places.
module.exports = (err, req, res, next) => {
  Sentry.Handlers.errorHandler()(
    err,
    req,
    res,
    errorFormatter.bind(null, err, req, res, next),
  );
};
