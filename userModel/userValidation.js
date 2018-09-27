const validator = require('validator');
const moment = require('moment');

const MIN_AGE = 13;

module.exports = (schema) => {
  schema.path('name')
    .required(true, 'A name is required');

  schema.path('email')
    .required(true, 'A user must have an email address')
    .validate(
      email => validator.isEmail(email),
      '{VALUE} is not a valid email address',
    );

  schema.path('phone')
    .validate(
      phone => (!phone || validator.isMobilePhone(phone, 'en-US')),
      '{VALUE} is not a valid phone number',
    );

  schema.path('birthYear')
    .validate(year => (year % 1 === 0), 'Birth year must be a round number')
    .validate(year => (year > 1900), 'Users born before 1900 are not supported')
    .validate(
      year => (year < (new Date().getFullYear() - MIN_AGE)),
      `Users must be at least ${MIN_AGE} years old`,
    );

  schema.path('birthMonth')
    .validate(month => (month % 1 === 0), 'Birth month must be a round number')
    .validate(month => (month <= 11 || month >= 0), 'Valid months are [0-11]')
    .validate(
      function hasBirthDate(month) {
        return month === undefined || (this.birthDate !== undefined);
      },
      'A birth month must be specified in conjuction with a birth date',
    );

  schema.path('birthDate')
    .validate(date => (date % 1 === 0), 'Birth date must be a round number')
    .validate(
      function hasBirthMonth(date) {
        return date === undefined || (this.birthMonth !== undefined);
      },
      'A birth date must be specified in conjuction with a birth month',
    )
    .validate(
      function dateMonthYearIsValid(date) {
        // Default to the year 2000 (a leap year) to be as generous as possible
        // when validating the month/date if no year is specified.
        return moment([this.birthYear || 2000, this.birthMonth, date]).isValid();
      },
      'The given birth date and month are not valid',
    );

  const urlValidationOptions = {
    protocols: ['http', 'https'],
    require_tld: true,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: true,
  };
  schema.path('imageURL')
    .validate(url => validator.isURL(url, urlValidationOptions));

  schema.path('funImageURL')
    .validate(url => validator.isURL(url, urlValidationOptions));
};
