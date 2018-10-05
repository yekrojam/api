const _ = require('lodash');
const debug = require('debug')('api');
const populateObjForElement = require('mongoose-populate-options/populateObjForElement');

function getQueryOpts(req) {
  return {
    authPayload: {
      user: req.user,
    },
    permissions: true,
  };
}

module.exports = {
  prefix: '',
  findOneAndUpdate: false,
  findOneAndRemove: false,
  lean: { virtuals: true },
  contextFilter: (model, req, done) => {
    done(model.find().setOptions(getQueryOpts(req)));
  },
  preMiddleware: (req, res, next) => {
    if (req.erm.query && req.erm.query.populate) {
      req.erm.query.populate = populateObjForElement(
        req.erm.query.populate,
        getQueryOpts(req),
        ['sort', 'limit', 'skip'],
      );
    }

    return next();
  },
  postDelete: (req, res) => {
    // Return the id of the just-deleted document to indicate success.
    res.status(200).json(req.erm.document.id);
  },
  onError: (err, req, res) => {
    debug(err);
    res.setHeader('Content-Type', 'application/json');

    const status = req.erm.statusCode || 400;
    let errorToShow = { message: err.message };
    if (err.name === 'ValidationError') {
      // Send back details to the client so they can intelligently tell the user what's up
      errorToShow = {
        message: err._message, // eslint-disable-line no-underscore-dangle
        name: err.name,
        errors: _.mapValues(err.errors, 'message'),
      };
    }
    res.status(status).json(errorToShow);
  },
};
