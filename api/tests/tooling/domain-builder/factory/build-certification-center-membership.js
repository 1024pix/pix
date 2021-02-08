const faker = require('faker');

const User = require('../../../../lib/domain/models/User');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const buildCertificationCenter = require('./build-certification-center');

function _buildUser() {
  return new User({
    id: faker.random.number(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.exampleEmail().toLowerCase(),
  });
}

module.exports = function buildCertificationCenterMembership({
  id = 1,
  certificationCenter = buildCertificationCenter(),
  user = _buildUser(),
  createdAt = faker.date.recent(),
} = {}) {

  return new CertificationCenterMembership({
    id,
    certificationCenter,
    user,
    createdAt,
  });
};
