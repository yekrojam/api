const test = require('ava');
const mongoose = require('mongoose');

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
  t.is(refUser.birthYear, referenceUserData.birthYear, 'birthyear should be unchanged');
  t.is(refUser.birthMonth, referenceUserData.birthMonth, 'birthMonth should be unchanged');
  t.is(refUser.birthDate, referenceUserData.birthDate, 'birthDay should be unchanged');
  t.is(refUser.imageURL, referenceUserData.imageURL, 'imageURL should be unchanged');
  t.is(refUser.funImageURL, referenceUserData.funImageURL, 'funImageURL should be unchanged');
});

test.todo('Name should be properly transformed (trimmed and dup whitespace removed');
test.todo('Email should be properly transformed');
test.todo('Email\'s must be unique');
test.todo('Phone should be properly transformed');
test.todo('Gender should be properly transformed');
test.todo('ImageURL should be properly transformed');
test.todo('funImageURL should be properly transformed');

test.after.always(async () => {
  await mongoose.disconnect();
});
