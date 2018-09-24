const test = require('ava');
const mongoose = require('mongoose');

const Org = require('../');
const referenceOrgData = require('./referenceOrgData');

test.before(async () => {
  await mongoose.connect('mongodb://localhost:27017/IndexTest', { useNewUrlParser: true });
});

test.beforeEach(async () => {
  await Org.remove({});
});

test.serial('Validate that all fields are present after saving', async (t) => {
  const refOrg = new Org(referenceOrgData);

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
  const refOrg = new Org(referenceOrgData);

  refOrg.urlSlug = '  text \t ';
  t.is(refOrg.urlSlug, 'text', 'Whitepsace should be trimmed');

  refOrg.urlSlug = 'UPPerCase';
  t.is(refOrg.urlSlug, 'uppercase', 'Slugs should be converted to lower case');
});

test('Make sure names are trimmed', (t) => {
  const refOrg = new Org(referenceOrgData);

  refOrg.name = '  some name \t ';
  t.is(refOrg.name, 'some name', 'Whitepsace should be trimmed');
});

test('Make sure descriptions are trimmed', (t) => {
  const refOrg = new Org(referenceOrgData);

  refOrg.description = '  some words\r continued here \t ';
  t.is(refOrg.description, 'some words\r continued here', 'Whitepsace should be trimmed');
});

test.serial('Orgs with different URL slugs', async (t) => {
  const refOrg1 = new Org(referenceOrgData);
  const refOrg2 = new Org({ ...referenceOrgData, urlSlug: 'someNewSlug' });

  await t.notThrowsAsync(
    Promise.all([refOrg1.save(), refOrg2.save()]),
    'Orgs with different URL Slugs should be able to be saved',
  );
});

test.serial('Orgs with the same URL slug', async (t) => {
  const refOrg1 = new Org(referenceOrgData);
  const refOrg2 = new Org(referenceOrgData);

  await t.throwsAsync(
    Promise.all([refOrg1.save(), refOrg2.save()]),
    { name: 'ValidationError' },
    'Orgs with same URL Slugs should not be allowed',
  );
});

test.serial('Orgs with same URL slug but different cases', async (t) => {
  const refOrg1 = new Org({ ...referenceOrgData, urlSlug: 'somenewslug' });
  const refOrg2 = new Org({ ...referenceOrgData, urlSlug: 'SOMENEWSLUG' });

  await t.throwsAsync(
    Promise.all([refOrg1.save(), refOrg2.save()]),
    { name: 'ValidationError' },
    'Orgs with url slugs in different cases shouldn\'t be allowed',
  );
});

test.after.always(async () => {
  await mongoose.disconnect();
});
