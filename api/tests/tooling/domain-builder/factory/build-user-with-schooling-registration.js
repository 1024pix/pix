const UserWithSchoolingRegistration = require('../../../../lib/domain/models/UserWithSchoolingRegistration');

module.exports = function buildUserWithSchoolingRegistration({
  lastName = 'jeanne',
  firstName = 'serge',
  birthdate = '2001-05-07',
  username = this.lastName + this.firstName + '1234',
  email = this.lastName + this.firstName + '@example.net',
  isAuthenticatedFromGAR = false,
} = {}) {

  return new UserWithSchoolingRegistration({
    lastName,
    firstName,
    birthdate,
    username,
    email,
    isAuthenticatedFromGAR,
  });
};
