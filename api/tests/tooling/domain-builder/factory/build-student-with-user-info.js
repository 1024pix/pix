const faker = require('faker');
const moment = require('moment');
const StudentWithUserInfo = require('../../../../lib/domain/models/StudentWithUserInfo');

module.exports = function buildStudentWithUserInfo(
  {
    lastName = faker.name.lastName(),
    firstName = faker.name.firstName(),
    birthdate = moment(faker.date.past(2, '2009-12-31')).format('YYYY-MM-DD'),
    username = this.lastName + this.firstName + '1234',
    email = this.lastName + this.firstName + '@example.net',
    isAuthenticatedFromGAR = false,
  } = {}) {

  return new StudentWithUserInfo({
    lastName,
    firstName,
    birthdate,
    username,
    email,
    isAuthenticatedFromGAR
  });
};
