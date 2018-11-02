const test = require('ava');

const Org = require('../');
const referenceOrgData = require('./referenceOrgData');

test('URL Slug required', async (t) => {
  const org = new Org({ ...referenceOrgData, urlSlug: undefined });
  await t.throwsAsync(org.validate(), { name: 'ValidationError' });
});

test('URL Slug minimum length', async (t) => {
  const org = new Org({ ...referenceOrgData, urlSlug: 'ab' });
  await t.throwsAsync(
    org.validate(),
    { name: 'ValidationError' },
    '2 chars is too short for a slug',
  );

  const org2 = new Org({ ...referenceOrgData, urlSlug: '' });
  await t.throwsAsync(
    org2.validate(),
    { name: 'ValidationError' },
    'Empty string is not a valid slug',
  );
});

test('URL Slug containing only proper characters', async (t) => {
  const org = new Org({ ...referenceOrgData, urlSlug: 'no spaces' });
  await t.throwsAsync(
    org.validate(),
    { name: 'ValidationError' },
    'No spaces are allowed in URL slugs',
  );

  const org2 = new Org({ ...referenceOrgData, urlSlug: 'nobangs!' });
  await t.throwsAsync(
    org2.validate(),
    { name: 'ValidationError' },
    'No special characters are allowed',
  );
});

test('Name required', async (t) => {
  const org = new Org({ ...referenceOrgData, name: undefined });
  await t.throwsAsync(org.validate(), { name: 'ValidationError' });

  const org2 = new Org({ ...referenceOrgData, name: '' });
  await t.throwsAsync(org2.validate(), { name: 'ValidationError' });
});

test('Name maximum length', async (t) => {
  const org = new Org({ ...referenceOrgData, name: 'a'.repeat(51) });
  await t.throwsAsync(org.validate(), { name: 'ValidationError' });
});

test('Description required', async (t) => {
  const org = new Org({ ...referenceOrgData, description: undefined });
  await t.throwsAsync(org.validate(), { name: 'ValidationError' });
});

test('Description maximum length', async (t) => {
  const org = new Org({ ...referenceOrgData, description: 'a'.repeat(1001) });
  await t.throwsAsync(org.validate(), { name: 'ValidationError' });
});

test('Nav image is valid URL', async (t) => {
  const org = new Org({ ...referenceOrgData, navImg: 'https://www.example.com' });
  await t.notThrowsAsync(org.validate());

  const org2 = new Org({ ...referenceOrgData, navImg: 'http://www.example.com' });
  await t.throwsAsync(org2.validate());

  const org3 = new Org({ ...referenceOrgData, navImg: 'www.example.com' });
  await t.throwsAsync(org3.validate());

  const org4 = new Org({ ...referenceOrgData, navImg: '/image.png' });
  await t.throwsAsync(org4.validate());

  const org5 = new Org({ ...referenceOrgData, navImg: 'yo yo yo' });
  await t.throwsAsync(org5.validate());
});

test('Square image is valid URL', async (t) => {
  const org = new Org({ ...referenceOrgData, squareImg: 'https://www.example.com' });
  await t.notThrowsAsync(org.validate());

  const org2 = new Org({ ...referenceOrgData, squareImg: 'http://www.example.com' });
  await t.throwsAsync(org2.validate());

  const org3 = new Org({ ...referenceOrgData, squareImg: 'www.example.com' });
  await t.throwsAsync(org3.validate());

  const org4 = new Org({ ...referenceOrgData, navImg: '/image.png' });
  await t.throwsAsync(org4.validate());

  const org5 = new Org({ ...referenceOrgData, squareImg: 'yo yo yo' });
  await t.throwsAsync(org5.validate());
});
