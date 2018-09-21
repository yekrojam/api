const test = require('ava');
const mongoose = require('mongoose');
const referenceOrg = require('./referenceOrg');
const Org = require('../');

test.before(async () => {
  await mongoose.connect('mongodb://localhost:27017/OrgIndexTest', { useNewUrlParser: true });
});

test.beforeEach((t) => {
  // Make a new copies of the ref org before each test so they don't interfere with one another
  const refOrg1 = new Org();
  const refOrg2 = new Org();
  refOrg1.set(referenceOrg);
  refOrg2.set(referenceOrg);
  refOrg2.set('_id', 'somenewid'); // change the second id so those don't conflict
  Object.assign(t.context, { refOrg1, refOrg2 });
});

test.afterEach.always(async () => {
  await Org.remove({});
});

test('Orgs with different URL slugs', async (t) => {
  const { context: { refOrg1, refOrg2 } } = t;

  refOrg2.urlSlug = 'someNewSlug';
  await t.notThrowsAsync(
    Promise.all([refOrg1.save(), refOrg2.save()]),
    'Orgs with different URL Slugs should be able to be saved',
  );
});

test('Orgs with the same URL slug', async (t) => {
  const { context: { refOrg1, refOrg2 } } = t;

  await t.throwsAsync(
    Promise.all([refOrg1.save(), refOrg2.save()]),
    { name: 'ValidationError' },
    'Orgs with same URL Slugs should not be allowed',
  );
});

test('Orgs with same URL slug but different cases', async (t) => {
  const { context: { refOrg1, refOrg2 } } = t;

  refOrg1.urlSlug = 'somenewslug';
  refOrg2.urlSlug = 'SOMENEWSLUG';
  await t.throwsAsync(
    Promise.all([refOrg1.save(), refOrg2.save()]),
    { name: 'ValidationError' },
    'Orgs with url slugs in different cases shouldn\'t be allowed',
  );
});

test.after.always(async () => {
  await mongoose.disconnect();
});
