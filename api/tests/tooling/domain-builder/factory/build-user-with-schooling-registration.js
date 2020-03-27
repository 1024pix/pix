const faker = require('faker');
const moment = require('moment');
const UserWithSchoolingRegistration = require('../../../../lib/domain/models/UserWithSchoolingRegistration');

module.exports = function buildUserWithSchoolingRegistration(
  {
    lastName = faker.name.lastName(),
    firstName = faker.name.firstName(),
    birthdate = moment(faker.date.past(2, '2009-12-31')).format('YYYY-MM-DD'),
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
    isAuthenticatedFromGAR
  });
};
