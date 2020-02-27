const CertificationCenter = require('../../../../lib/domain/models/CertificationCenter');
const faker = require('faker');

module.exports = function buildCertificationCenter(
  {
    id = 1,
    name = faker.company.companyName(),
    type = faker.random.arrayElement(['SCO', 'PRO', 'SUP']),
    externalId = faker.random.word() + faker.random.number(1, 100000),
    createdAt = faker.date.recent(),
  } = {}) {
  return new CertificationCenter({
    id,
    name,
    type,
    externalId,
    createdAt,
  });
};
