const selectVirtuals = require('mongoose-select-virtuals');
const leanVirtuals = require('mongoose-lean-virtuals');
const idValidator = require('mongoose-id-validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const shortId = require('shortid');

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
      return rest;
    },
  };
  schema.set('toObject', toObjectOptions);
  schema.set('toJSON', toObjectOptions);

  schema.plugin(idValidator);
  schema.plugin(leanVirtuals);
  schema.plugin(selectVirtuals);
  schema.plugin(beautifyUnique);

  // We want to strip out `_id` and `__v` from lean qeries, just like we do with `toJSON` and
  // `toObject`.
  function stripDocumentArtifacts(res) {
    if (!this._mongooseOptions.lean) return;

    const docs = Array.isArray(res) ? res : [res];

    docs.forEach((doc) => {
      delete doc._id; // eslint-disable-line no-param-reassign
      delete doc.__v; // eslint-disable-line no-param-reassign
    });
  }

  schema.post('find', stripDocumentArtifacts);
  schema.post('findOne', stripDocumentArtifacts);
  schema.post('findOneAndUpdate', stripDocumentArtifacts);
};
