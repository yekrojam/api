const test = require('ava');
const mongoose = require('mongoose');

const Org = require('../');
const referenceOrg = require('./referenceOrg');

test.before(async () => {
  await mongoose.connect('mongodb://localhost:27017/IndexTest', { useNewUrlParser: true });
});

test.beforeEach((t) => {
  // Make a new copy of the ref org before each test so they don't interfere with one another
  const refOrg = new Org();
  refOrg.set(referenceOrg);
  Object.assign(t.context, { refOrg });
});

test('Validate that all fields are present after saving', async (t) => {
  const { context: { refOrg } } = t;

  const originalURLSlug = refOrg.urlSlug;
  const originalName = refOrg.name;
  const originalDescription = refOrg.description;
  const originalNavImg = refOrg.navImg;
  const originalSquareImg = refOrg.squareImg;

  await refOrg.save();

  t.is(refOrg.urlSlug, originalURLSlug, 'URLSlug should be unchanged');
  t.is(refOrg.name, originalName, 'Name should be unchanged');
  t.is(refOrg.description, originalDescription, 'Description should be unchanged');
  t.is(refOrg.navImg, originalNavImg, 'NavImg should be unchanged');
  t.is(refOrg.squareImg, originalSquareImg, 'SquareImg should be unchanged');
});

test('Make sure URL slugs are trimmed and lower cased', (t) => {
  const { context: { refOrg } } = t;

  refOrg.urlSlug = '  text \t ';
  t.is(refOrg.urlSlug, 'text', 'Whitepsace should be trimmed');

  refOrg.urlSlug = 'UPPerCase';
  t.is(refOrg.urlSlug, 'uppercase', 'Slugs should be converted to lower case');
});

test('Make sure names are trimmed', (t) => {
  const { context: { refOrg } } = t;

  refOrg.name = '  some name \t ';
  t.is(refOrg.name, 'some name', 'Whitepsace should be trimmed');
});

test('Make sure descriptions are trimmed', (t) => {
  const { context: { refOrg } } = t;

  refOrg.description = '  some words\r continued here \t ';
  t.is(refOrg.description, 'some words\r continued here', 'Whitepsace should be trimmed');
});

test.after.always(async () => {
  await mongoose.disconnect();
});
