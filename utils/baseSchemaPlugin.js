const selectVirtuals = require('mongoose-select-virtuals');
const leanVirtuals = require('mongoose-lean-virtuals');
const idValidator = require('mongoose-id-validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const populateOptions = require('mongoose-populate-options');
const shortId = require('shortid');
const authz = require('mongoose-authz');

module.exports = (schema) => {
  schema.path('_id', String);
  schema.path('_id').default(shortId.generate);

  schema.set('timestamps', true);
  schema.set('strictQuery', true);

  const toObjectOptions = {
    getters: true,
    versionKey: false,
    transform(doc, ret) {
      const { _id, ...rest } = ret;

      // Because documents `mongoose-authz` adds the list of permissions directly
      // to the document (myDoc.permissions = {...}), they don't get serialized
      // by default. Do it manually here.
      if (doc.permissions) { rest.permissions = doc.permissions; }

      return rest;
    },
  };
  schema.set('toObject', toObjectOptions);
  schema.set('toJSON', toObjectOptions);

  schema.plugin(idValidator);
  schema.plugin(leanVirtuals);
  schema.plugin(selectVirtuals);
  schema.plugin(beautifyUnique);
  schema.plugin(populateOptions);

  if (schema.permissions) {
    // Allow the create method until the express-restify-mongoose lib is patched
    schema.plugin(authz, { allowedMethods: ['create', 'remove'] });
  }
};
