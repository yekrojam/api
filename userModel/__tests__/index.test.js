const test = require('ava');
const mongoose = require('mongoose');
const axios = require('axios');

const User = require('../');
const referenceUserData = require('./referenceUserData');

test.before(async () => {
  await mongoose.connect('mongodb://localhost:27017/UserIndexTest', { useNewUrlParser: true });
});

test.beforeEach(async () => {
  await User.remove({});
});

test.serial('Validate that all fields are present after saving', async (t) => {
  const refUser = new User(referenceUserData);

  await refUser.save();

  t.is(refUser.name, referenceUserData.name, 'name should be unchanged');
  t.is(refUser.email, referenceUserData.email, 'email should be unchanged');
  t.is(refUser.phone, referenceUserData.phone, 'phone should be unchanged');
  t.is(refUser.gender, referenceUserData.gender, 'gender should be unchanged');
  t.is(refUser.birthYear, referenceUserData.birthYear, 'birthYear should be unchanged');
  t.is(refUser.birthMonth, referenceUserData.birthMonth, 'birthMonth should be unchanged');
  t.is(refUser.birthDate, referenceUserData.birthDate, 'birthDay should be unchanged');
  t.is(refUser.imageURL, referenceUserData.imageURL, 'imageURL should be unchanged');
  t.is(refUser.funImageURL, referenceUserData.funImageURL, 'funImageURL should be unchanged');
  t.is(
    refUser.defaultedImageURL,
    referenceUserData.imageURL,
    'defaultedImageURL should be same as imageURL',
  );
});

test.todo('Name should be properly transformed (trimmed and dup whitespace removed');
test.todo('Email should be properly transformed');
test.todo('Email\'s must be unique');
test.todo('Phone should be properly transformed');
test.todo('Gender should be properly transformed');
test.todo('ImageURL should be properly transformed');
test.todo('funImageURL should be properly transformed');

test('defaultedImageURL should always be a valid URL', async (t) => {
  const user = new User({ ...referenceUserData, imageURL: undefined });
  const { defaultedImageURL } = user;

  const response = await axios.get(defaultedImageURL);
  t.is(response.status, 200, 'A successful response should come back');
  t.is(response.headers['content-type'], 'image/png', 'An image should come back');
});

test.after.always(async () => {
  await mongoose.disconnect();
});
