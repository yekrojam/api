const debug = require('debug')('api');
const populateObjForElement = require('mongoose-populate-options/populateObjForElement');


function getQueryOpts(req) {
  return {
    authPayload: {
      user: req.user,
    },
    permissions: true,
    lean: { virtuals: true },
  };
}

module.exports = {
  findOneAndUpdate: false,
  findOneAndRemove: false,
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
  postDelete: (req, res, next) => {
    // Return the id of the just-deleted document to indicate success.
    res.status(200).json(req.erm.document.id);
  },
  onError: (err, req, res) => {
    debug(err);
    res.setHeader('Content-Type', 'application/json');

    const status = req.erm.statusCode || 400;
    res.status(status).json({ message: err.message });
  },
};
