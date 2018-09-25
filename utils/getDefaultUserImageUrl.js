const md5 = require('md5');
const { stringify } = require('qs');

const QUERY = stringify({
  d: 'identicon',
  s: 480,
});

/**
 * If no imageUrl is specified, display a gravatar image based on a hash
 * of the user's email address. Assumes the email has already been normalized
 * (ie: trimmed and lowercased).
 *
 * See: https://en.gravatar.com/site/implement/images/
 */
module.exports = email => `https://s.gravatar.com/avatar/${md5(email)}?${QUERY}`;
