const getQueryOpts = require('../utils/getQueryOpts');

function setModelQueryHandler(req, res, next) {
  const queryOpts = getQueryOpts(req);
  req.modelQuery = this.model.find().setOptions(queryOpts);

  next();
}

function setWriteOptionsHandler(req, res, next) {
  req.writeOptions = getQueryOpts(req);
  next();
}

function setPopulateOptionsHook(req, res, item, next) {
  // This is a little strange. When passed as a hook in `index()`, the `item` is
  // the query. When passed to `get()`, the `item` is the search object. Poor
  // API.
  //
  // To reliably get the query, we read it from `req.modelQuery` since we know
  // it should hold a reference because we set it in an earlier handler.
  //
  // Also, we do this logic in a hook (as opposed to a handler) because the populate
  // options should have have been set by this point.
  const queryOpts = getQueryOpts(req);
  req.modelQuery.setPopulateOptions(queryOpts, ['sort', 'limit', 'skip', 'select']);
  next();
}

function customDeleteResponseHandler(req, res, next) {
  const { resource } = req;
  if (resource.deleted) {
    // DELETE worked. Transform it a little bit so client can do some magic
    resource.status = 200;
    resource.item = resource.item.id;
  }

  next();
}

module.exports = {
  before: [setModelQueryHandler],
  beforeIndex: [],
  beforePost: [setWriteOptionsHandler],
  beforeGet: [],
  beforePut: [setWriteOptionsHandler],
  beforePatch: [setWriteOptionsHandler],
  beforeDelete: [setWriteOptionsHandler],
  // after: [],
  afterIndex: [],
  afterPost: [],
  afterGet: [],
  afterPut: [],
  afterPatch: [],
  afterDelete: [customDeleteResponseHandler],
  hooks: {
    index: {
      before: setPopulateOptionsHook,
    },
    get: {
      before: setPopulateOptionsHook,
    },
  },
};
