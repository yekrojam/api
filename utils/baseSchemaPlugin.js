const selectVirtuals = require('mongoose-select-virtuals');
const leanVirtuals = require('mongoose-lean-virtuals');
const idValidator = require('mongoose-id-validator');
const shortId = require('shortid');
const uniqueValidator = require('mongoose-unique-validator');

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
  schema.plugin(uniqueValidator);
};
