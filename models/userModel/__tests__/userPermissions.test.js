const test = require('ava');
const mongoose = require('mongoose');

const User = require('../');
const Membership = require('../../membershipModel');
const Org = require('../../orgModel');
const referenceUserData = require('./referenceUserData');
const referenceOrgData = require('../../orgModel/__tests__/referenceOrgData');

const getAuthMemberships = require('../../../utils/getAuthMemberships');

test.before(async (t) => {
  await mongoose.connect('mongodb://localhost:27017/UserPermissionsTest', { useNewUrlParser: true });

  await User.remove({});
  await Membership.remove({});
  await Org.remove({});

  // Users
  const singleOrgMember = await new User({
    ...referenceUserData,
    email: 'singleOrgMember@example.com',
  }).save({ authLevel: false });
  const singleOrgAdmin = await new User({
    ...referenceUserData,
    email: 'singleOrgAdmin@example.com',
  }).save({ authLevel: false });
  const multiOrgMember1 = await new User({
    ...referenceUserData,
    email: 'multiOrgMember1@example.com',
  }).save({ authLevel: false });
  const multiOrgMember2 = await new User({
    ...referenceUserData,
    email: 'multiOrgMember2@example.com',
  }).save({ authLevel: false });
  const multiOrgAdmin = await new User({
    ...referenceUserData,
    email: 'multiOrgAdmin@example.com',
  }).save({ authLevel: false });

  // Orgs
  const soloOrg = await new Org({
    ...referenceOrgData,
    urlSlug: 'soloorg',
  }).save({ authLevel: false });
  const generalOrg1 = await new Org({
    ...referenceOrgData,
    urlSlug: 'generalorg1',
  }).save({ authLevel: false });
  const generalOrg2 = await new Org({
    ...referenceOrgData,
    urlSlug: 'generalorg2',
  }).save({ authLevel: false });

  // Memberships
  await new Membership({
    org: soloOrg,
    user: singleOrgMember,
    roles: [Membership.ROLES.Member],
  }).save({ authLevel: false });
  await new Membership({
    org: soloOrg,
    user: singleOrgAdmin,
    roles: [Membership.ROLES.Member, Membership.ROLES.Admin],
  }).save({ authLevel: false });
  await new Membership({
    org: generalOrg1,
    user: multiOrgMember1,
    roles: [Membership.ROLES.Member],
  }).save({ authLevel: false });
  await new Membership({
    org: generalOrg1,
    user: multiOrgMember2,
    roles: [Membership.ROLES.Member],
  }).save({ authLevel: false });
  await new Membership({
    org: generalOrg2,
    user: multiOrgMember2,
    roles: [Membership.ROLES.Member, Membership.ROLES.Admin],
  }).save({ authLevel: false });
  await new Membership({
    org: generalOrg1,
    user: multiOrgAdmin,
    roles: [Membership.ROLES.Admin],
  }).save({ authLevel: false });

  Object.assign(t.context, {
    singleOrgMember,
    singleOrgAdmin,
    multiOrgMember1,
    multiOrgMember2,
    multiOrgAdmin,
  });
});

test('Logged out users can create a user', async (t) => {
  const newUser = new User({ ...referenceUserData, email: 'newuser@example.com' });
  await t.notThrowsAsync(
    newUser.save({ authPayload: {} }),
    'Logged out users should be able to create a user',
  );
});

test('Logged in admins can create users', async (t) => {
  const { singleOrgAdmin, multiOrgAdmin } = t.context;

  await t.notThrowsAsync(
    new User({ ...referenceUserData, email: 'newuserSingleAdmin@example.com' })
      .save({
        authPayload: {
          userId: singleOrgAdmin.id,
          userMemberships: await getAuthMemberships(singleOrgAdmin.id),
        },
      }),
    'Admins of single orgs should be able to create users',
  );

  await t.notThrowsAsync(
    new User({ ...referenceUserData, email: 'newuserMultiAdmin@example.com' })
      .save({
        authPayload: {
          userId: multiOrgAdmin.id,
          userMemberships: await getAuthMemberships(multiOrgAdmin.id),
        },
      }),
    'Admins of multiple orgs should be able to create users',
  );
});

test('Logged in non-admins cannot create users', async (t) => {
  const { singleOrgMember, multiOrgMember1 } = t.context;

  await t.throwsAsync(
    new User({ ...referenceUserData, email: 'loggedinnonadmin@example.com' })
      .save({
        authPayload: {
          userId: singleOrgMember.id,
          userMemberships: await getAuthMemberships(singleOrgMember.id),
        },
      }),
    { name: 'PermissionDenied' },
    'Regular members of single orgs should not be able to create users',
  );

  await t.throwsAsync(
    new User({ ...referenceUserData, email: 'loggedinnonadminmulti@example.com' })
      .save({
        authPayload: {
          userId: multiOrgMember1.id,
          userMemberships: await getAuthMemberships(multiOrgMember1.id),
        },
      }),
    { name: 'PermissionDenied' },
    'Regular members of multiple orgs should not be able to create users',
  );
});

test('Logged out users cannot edit any profile', async (t) => {
  const { singleOrgMember } = t.context;
  // Copy the user object so we don't mess with other tests
  const userCopy = new User({}).set(singleOrgMember);

  userCopy.name = 'foobar';
  await t.throwsAsync(
    userCopy.save({ authPayload: {} }),
    { name: 'PermissionDenied' },
    'Direct editing should not be allowed by unauth user',
  );
});

test('A user can edit their own profile', async (t) => {
  const { singleOrgMember: { id: userId } } = t.context;
  const foundUser = await User.findById(userId)
    .setOptions({
      authPayload: {
        userId,
        userMemberships: await getAuthMemberships(userId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.write.sort(),
    ['name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'updatedAt'].sort(),
    'Users should be able to edit the specified fields on their own profile',
  );
});

test('A member of the same org cannot edit a peer\'s profile', async (t) => {
  const { multiOrgMember1: { id: targetId }, multiOrgMember2: { id: actorId } } = t.context;
  const foundUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        userId: actorId,
        userMemberships: await getAuthMemberships(actorId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.write,
    [],
    'Org peers should not be able to edit one another\'s profiles',
  );
});

test('An admin of a user in 1 org can edit their entire profile', async (t) => {
  const { singleOrgMember: { id: targetId }, singleOrgAdmin: { id: actorId } } = t.context;
  const foundUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        userId: actorId,
        userMemberships: await getAuthMemberships(actorId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.write,
    ['name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'updatedAt'],
  );
});

test('An admin of a user in multiple orgs can edit limited fields', async (t) => {
  const { multiOrgMember2: { id: targetId }, multiOrgAdmin: { id: actorId } } = t.context;
  const foundUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        userId: actorId,
        userMemberships: await getAuthMemberships(actorId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.write.sort(),
    ['name', 'email', 'gender', 'updatedAt'].sort(),
  );
});

test('A user can read their own profile', async (t) => {
  const { singleOrgMember: { id: userId } } = t.context;
  const foundUser = await User.findById(userId)
    .setOptions({
      authPayload: {
        userId,
        userMemberships: await getAuthMemberships(userId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.read.sort(),
    ['_id', 'id', 'name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'createdAt'].sort(),
  );
});

test('A member of the same org can read a fellow member profile', async (t) => {
  const { multiOrgMember1: { id: targetId }, multiOrgMember2: { id: actorId } } = t.context;
  const foundUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        userId: actorId,
        userMemberships: await getAuthMemberships(actorId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.read.sort(),
    ['_id', 'id', 'name', 'email', 'phone', 'gender', 'birthYear', 'birthMonth', 'birthDate', 'imageURL', 'funImageURL', 'createdAt'].sort(),
  );
});

test('Members of different orgs cannot read each other\'s profile', async (t) => {
  const { multiOrgMember1: { id: targetId }, singleOrgAdmin: { id: actorId } } = t.context;
  const foundUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        actorId,
        userMemberships: await getAuthMemberships(actorId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.read,
    [],
  );
});

test('Admin of other org cannot read member profile', async (t) => {
  const { singleOrgMember: { id: targetId }, multiOrgAdmin: { id: actorId } } = t.context;
  const foundUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        userId: actorId,
        userMemberships: await getAuthMemberships(actorId),
      },
      permissions: true,
    })
    .exec();

  t.deepEqual(
    foundUser.permissions.read,
    [],
    'Admins of other orgs cannot read arbitrary users',
  );
  t.deepEqual(
    foundUser.permissions.write,
    [],
    'Admins of other orgs cannot write to arbitrary users',
  );
});

test('A logged out user cannot see anyone\'s profile', async (t) => {
  const { singleOrgMember: { email } } = t.context;
  const queryOptions = { authPayload: {} };
  const users = await User.find({ email }).setOptions(queryOptions).exec();
  t.is(users.length, 0, 'No users should come back when an unathed user is querying');
});

test('No one can remove a profile', async (t) => {
  const { singleOrgMember: { id: targetId }, singleOrgAdmin: { id: adminId } } = t.context;
  const selfUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        userId: targetId,
        userMemberships: await getAuthMemberships(targetId),
      },
      permissions: true,
    })
    .exec();

  t.false(
    selfUser.permissions.remove,
    'Users should not remove own profile',
  );

  const adminedUser = await User.findById(targetId)
    .setOptions({
      authPayload: {
        userId: adminId,
        userMemberships: await getAuthMemberships(adminId),
      },
      permissions: true,
    })
    .exec();

  t.false(
    adminedUser.permissions.remove,
    'Admins should not remove profiles',
  );
});

test.after.always(async () => {
  await mongoose.disconnect();
});
