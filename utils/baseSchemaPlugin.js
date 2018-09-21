const _ = require('lodash');
const http = require('http');
const selectVirtuals = require('mongoose-select-virtuals');
const leanVirtuals = require('mongoose-lean-virtuals');
const idValidator = require('mongoose-id-validator');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const authz = require('mongoose-authz');
const shortId = require('shortid');

module.exports = (schema) => {
  schema.path('_id', String);
  schema.path('_id').default(shortId.generate);

  schema.set('timestamps', true);
  schema.set('toObject', { getters: true, versionKey: false });
  schema.set('toJSON', { getters: true, versionKey: false });
  schema.set('strictQuery', true);

  schema.plugin(idValidator);
  schema.plugin(leanVirtuals);
  schema.plugin(selectVirtuals);
  schema.plugin(beautifyUnique);
  // TODO (makinde 8/25/18): Bring back when ready to implement auth across the board
  // schema.plugin(authz);

  // H4x
  schema.post('findOne', (doc) => {
    if (_.isEmpty(doc)) {
      throw new Error(http.STATUS_CODES[404]);
    }
  });
};
