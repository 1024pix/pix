const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const faker = require('faker');

module.exports = function buildCertificationCenter(
  {
    id = 1,
    name = faker.company.companyName(),
    createdAt = faker.date.recent(),
  } = {}) {
  return new CertificationCenter({
    id,
    name,
    createdAt,
  });
};
