const faker = require('faker');
const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');

module.exports = function buildCertificationIssueReport({
  id = faker.random.number(),
  certificationCourseId,
  category,
  description = null,
} = {}) {
  return new CertificationIssueReport({
    id,
    certificationCourseId,
    category,
    description,
  });
};
