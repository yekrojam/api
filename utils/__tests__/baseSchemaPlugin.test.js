const test = require('ava');
const mongoose = require('mongoose');
const baseSchemaPlugin = require('../baseSchemaPlugin');

const personSchema = new mongoose.Schema({
  name: String,
  friend: {
    type: String,
    ref: 'Person',
  },
});
personSchema.virtual('virtual_prop').get(() => 'some value');
personSchema.plugin(baseSchemaPlugin);

const Person = mongoose.model('Person', personSchema);

const authzSchema = new mongoose.Schema({});
authzSchema.permissions = { foo: {} };
authzSchema.plugin(baseSchemaPlugin);

test.before(async () => {
  await mongoose.connect(
    'mongodb://localhost:27017/BaseSchemaPluginTest',
    { useNewUrlParser: true },
  );
  await Person.remove({});
});

test('_id should be an auto-generated string', (t) => {
  const { _id } = new Person({});

  t.is(typeof _id, 'string', '_id should be a string');
  t.truthy(_id, '_id should be atomatically assigned');
  t.truthy(_id.length > 0, '_id should not be empty');
});

test('Timestamps should be automatically set', async (t) => {
  const person = await Person.create({ name: 'foo' });

  t.truthy(person.createdAt instanceof Date, 'createdAt should be assigned and a Date');
  t.truthy(person.updatedAt instanceof Date, 'updatedAt should be assigned and a Date');

  person.name = 'something new';
  await person.save();

  t.truthy(person.updatedAt > person.createdAt, 'updatedAt should be set after changes');
});

test('toObject & toJSON should serialize correctly', async (t) => {
  const person = new Person({ name: 'foo' });
  await person.save();

  const expectedOutput = {
    id: person.id,
    name: person.name,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
    virtual_prop: 'some value',
  };

  t.deepEqual(person.toObject(), expectedOutput, 'message');
  t.deepEqual(person.toJSON(), expectedOutput, 'message');
});

test('Reference ID\'s should be validated', async (t) => {
  const person = new Person({ name: 'foo', friend: 'this does not exist' });

  await t.throwsAsync(
    person.save(),
    { name: 'ValidationError' },
    'Should not be able to save objects with references to non-existing documents',
  );
});

test('Correct document references should be allowed', async (t) => {
  const person1 = await Person.create({ name: 'person1' });

  await t.notThrowsAsync(
    Person.create({ name: 'person2', friend: person1.id }),
    'Should be able to create documents with valid references to others',
  );
});

test('Virtuals should be returned on lean queries', async (t) => {
  const person = await Person.create({ name: 'findable' });
  const expectedOutput = {
    _id: person.id,
    id: person.id,
    name: person.name,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
    virtual_prop: 'some value',
    __v: 0,
  };

  t.deepEqual(
    await Person.find({ name: 'findable' }).lean({ virtuals: true }).exec(),
    [expectedOutput],
    'Virtuals should be included when lean is `{virtuals: true}`',
  );
  t.deepEqual(
    await Person.find({ name: 'findable' }).lean({ virtuals: ['id', 'virtual_prop'] }).exec(),
    [expectedOutput],
    'Virtuals should be included when lean is `{virtuals: \'virtual_prop\'}`',
  );
});

test('Virtuals should work in the select statement', async (t) => {
  const person = await Person.create({ name: 'hunt' });

  t.deepEqual(
    await Person.find({ name: 'hunt' }, 'virtual_prop').lean().exec(),
    [{ _id: person.id, virtual_prop: 'some value' }],
    'Wrong fields for just a virtual selection',
  );

  t.deepEqual(
    await Person.find({ name: 'hunt' }, 'name virtual_prop').lean().exec(),
    [{ _id: person.id, name: 'hunt', virtual_prop: 'some value' }],
    'Wrong fields for a real and virtual selection',
  );

  t.deepEqual(
    await Person.find({ name: 'hunt' }, 'id name').lean().exec(),
    [{ _id: person.id, id: person.id, name: 'hunt' }],
    'Wrong fields for a real and `id` selection',
  );
});

test.todo('Population is functional');

test('authz plugin gets installed for schemas with permissions', (t) => {
  // Janky way of testing to see if the plugin is present, but this is the only marker
  // that the plugin leaves.
  t.is(
    personSchema.query.setAuthLevel,
    undefined,
    'The authz plugin should not be installed when no permissions are set',
  );

  t.truthy(
    authzSchema.query.setAuthLevel,
    'authz plugin should be installed when permissions are set',
  );
});

test.after.always(async () => {
  await mongoose.disconnect();
});
