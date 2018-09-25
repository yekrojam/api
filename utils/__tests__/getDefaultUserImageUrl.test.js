const test = require('ava');
const md5 = require('md5');

const getDefaultUserImageUrl = require('../getDefaultUserImageUrl');

test('The correct default image URL is returned', (t) => {
  const email = 'test@test.com';
  const imageURL = getDefaultUserImageUrl(email);

  t.is(
    imageURL.indexOf('https://s.gravatar.com/avatar/'),
    0,
    'It has the correct base url',
  );

  t.not(
    imageURL.indexOf(md5(email)),
    -1,
    'It has the correct email hash',
  );

  t.is(
    imageURL.split('?')[1],
    'd=identicon&s=480',
    'It has the correct query params',
  );
});
