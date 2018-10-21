const populateObjForElement = require('mongoose-populate-options/populateObjForElement');
const errorHandler = require('../middleware/errorHandler');

function getQueryOpts(req) {
  return {
    authPayload: {
      userId: req.user.id,
    },
    permissions: true,
  };
}

module.exports = {
  prefix: '',
  findOneAndUpdate: false,
  findOneAndRemove: false,
  lean: { virtuals: true },
  onError: errorHandler,
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
};
