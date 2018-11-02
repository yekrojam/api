const test = require('ava');
const mongoose = require('mongoose');

const Membership = require('../');

test.before(async () => {
  await mongoose.connect(
    'mongodb://localhost:27017/MembershipIndexTest',
    { useNewUrlParser: true },
  );
});

test.beforeEach(async () => {
  await Membership.remove({});
});

test.todo('Valid memberships can can be successfully saved and retrieved');
test.todo('Org and User combos must be unique');

test.after.always(async () => {
  await mongoose.disconnect();
});
