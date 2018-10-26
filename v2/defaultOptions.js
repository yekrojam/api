const getQueryOpts = require('../utils/getQueryOpts');

module.exports = {
  before: [
    function queryAndWriteOptions(req, res, next) {
      const queryOpts = getQueryOpts(req);

      if (req.method === 'GET') {
        queryOpts.lean = { virtuals: true };
      }

      req.modelQuery = this.model.find().setOptions(queryOpts);
      req.writeOptions = queryOpts;

      // Resource.js only supports really basic population. We manually inspect
      // the populate query param to allow it to be a full options object
      if (req.query.populate) {
        let populateSetting = req.query.populate;
        if (populateSetting[0] === '{' || populateSetting[0] === '[') {
          populateSetting = JSON.parse(populateSetting);
        }

        req.modelQuery
          .populate(populateSetting)
          .setPopulateOptions(queryOpts, ['sort', 'limit', 'skip', 'select']);

        // Remove `populate` from `req.query` so Resource doesn't try to handle it.
        delete req.query.populate;
      }

      next();
    },
  ],
  beforeIndex: [],
  beforePost: [],
  beforeGet: [],
  beforePut: [],
  beforePatch: [],
  beforeDelete: [],
  // after: [],
  afterIndex: [],
  afterPost: [],
  afterGet: [],
  afterPut: [],
  afterPatch: [],
  afterDelete: [
    function customDeleteResponse(req, res, next) {
      const { resource } = req;
      if (resource.deleted) {
        // DELETE worked. Transform it a little bit so client can do some magic
        resource.status = 200;
        resource.item = resource.item.id;
      }

      next();
    },
  ],
};
