const _ = require('lodash');

module.exports = (schema) => {
  schema.post('find', async function addDefaultSetting(docs) {
    const { kind, target } = this.getQuery();

    // Only create this doc is there's not one already AND there a
    // kind/target, which is what we need to create a default one
    if (!_.isEmpty(docs) || !kind || !target) return;

    // Only `Model.create` casts to the correct discriminator class, FML
    // Also, pass an array (even though we're only creating one) because
    // we'll need to add options to support authorization. And, you guessed
    // it: `Model.create` only supports options when the first param is an
    // array!
    const newSettings = await this.model.create([{ kind, target }]);

    // Okay, only add the first thing in the array.
    docs.push(newSettings[0]);
  });
};
