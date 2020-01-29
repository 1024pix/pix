const faker = require('faker');
const CertificationReport = require('../../../../lib/domain/models/CertificationReport');

module.exports = function buildCertificationReport(
  {
    id = faker.random.number(),
    // attributes
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    examinerComment = faker.lorem.sentence(),
    hasSeenEndTestScreen = false,
    // references
    certificationCourseId = faker.random.number(),
  } = {}) {

  return new CertificationReport({
    id,
    certificationCourseId,
    firstName,
    lastName,
    examinerComment,
    hasSeenEndTestScreen,
  });
};
