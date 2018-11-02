const test = require('ava');
const mongoose = require('mongoose');

const Org = require('../');
const Membership = require('../../membershipModel');
const User = require('../../userModel');
const referenceUserData = require('../../userModel/__tests__/referenceUserData');
const referenceOrgData = require('./referenceOrgData');
const getAuthMemberships = require('../../../utils/getAuthMemberships');

test.before(async (t) => {
  await mongoose.connect('mongodb://localhost:27017/OrgPermissionsTest', { useNewUrlParser: true });

  await User.remove({});
  await Membership.remove({});
  await Org.remove({});

  // Users
  const orgMember = await new User({
    ...referenceUserData,
    email: 'orgMember@example.com',
  }).save({ authLevel: false });
  const orgAdmin = await new User({
    ...referenceUserData,
    email: 'orgAdmin@example.com',
  }).save({ authLevel: false });
  const randoUser = await new User({
    ...referenceUserData,
    email: 'randoUser@example.com',
  }).save({ authLevel: false });

  // Orgs
  const org = await new Org({
    ...referenceOrgData,
    urlSlug: 'myorg',
  }).save({ authLevel: false });

  // Memberships
  await new Membership({
    org,
    user: orgMember,
    roles: [Membership.ROLES.Member],
  }).save({ authLevel: false });
  await new Membership({
    org,
    user: orgAdmin,
    roles: [Membership.ROLES.Admin],
  }).save({ authLevel: false });

  Object.assign(t.context, {
    orgMember,
    orgAdmin,
    randoUser,
    org,
  });
});

test('Logged out users cannot see any information', async (t) => {
  const queryOptions = { authPayload: { userId: false, userMemberships: [] } };
  const orgs = await Org.find({}).setOptions(queryOptions).exec();
  t.is(orgs.length, 0, 'No orgs should come back when an unathed user is querying');
});

test('Logged out users cannot create', async (t) => {
  const queryOptions = { authPayload: { userId: false, userMemberships: [] } };
  const newOrg = new Org({
    ...referenceOrgData,
    urlSlug: 'myneworg',
  });

  await t.throwsAsync(
    newOrg.save(queryOptions),
    { name: 'PermissionDenied' },
  );
});

test.serial('A logged in user can create an org', async (t) => {
  const { randoUser: { id: userId } } = t.context;
  const queryOptions = {
    authPayload: {
      userId,
      userMemberships: await getAuthMemberships(userId),
    },
  };
  const newOrg = new Org({
    ...referenceOrgData,
    urlSlug: 'randouserorg',
  });

  await t.notThrowsAsync(newOrg.save(queryOptions));

  // Cleanup
  await newOrg.remove({ authLevel: false });
});

test('Members of another org cannot see the org', async (t) => {
  const { randoUser: { id: userId } } = t.context;
  const queryOptions = {
    authPayload: {
      userId,
      userMemberships: await getAuthMemberships(userId),
    },
  };

  const orgs = await Org.find({}).setOptions(queryOptions).exec();
  t.is(orgs.length, 0);
});

test('Members of an org can view the org', async (t) => {
  const { orgMember: { id: userId } } = t.context;
  const queryOptions = {
    authPayload: {
      userId,
      userMemberships: await getAuthMemberships(userId),
    },
  };

  const orgs = await Org.find({}).setOptions(queryOptions).exec();
  t.is(orgs.length, 1);
});

test('Admins of an org can view the org', async (t) => {
  const { orgAdmin: { id: userId } } = t.context;
  const queryOptions = {
    authPayload: {
      userId,
      userMemberships: await getAuthMemberships(userId),
    },
  };

  const orgs = await Org.find({}).setOptions(queryOptions).exec();
  t.is(orgs.length, 1);
});

test('Admins of an org can edit the org', async (t) => {
  const { orgAdmin: { id: userId } } = t.context;
  const queryOptions = {
    authPayload: {
      userId,
      userMemberships: await getAuthMemberships(userId),
    },
    permissions: true,
  };

  const [org] = await Org.find({}).setOptions(queryOptions).exec();
  t.deepEqual(
    org.permissions.write.sort(),
    ['name', 'description', 'navImg', 'squareImg'].sort(),
  );
});

test('No one can delete an org', async (t) => {
  const { orgAdmin: { id: userId } } = t.context;
  const queryOptions = {
    authPayload: {
      userId,
      userMemberships: await getAuthMemberships(userId),
    },
    permissions: true,
  };

  const [org] = await Org.find({}).setOptions(queryOptions).exec();
  t.false(org.permissions.remove);
});

test.after.always(async () => {
  await mongoose.disconnect();
});
