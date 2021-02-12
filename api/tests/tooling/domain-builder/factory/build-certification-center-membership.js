const User = require('../../../../lib/domain/models/User');
const CertificationCenterMembership = require('../../../../lib/domain/models/CertificationCenterMembership');
const buildCertificationCenter = require('./build-certification-center');

function _buildUser() {
  return new User({
    id: 456,
    firstName: 'Bertrand',
    lastName: 'Nolan',
    email: 'bertrand.nolan@example.net',
  });
}

module.exports = function buildCertificationCenterMembership({
  id = 1,
  certificationCenter = buildCertificationCenter(),
  user = _buildUser(),
  createdAt = new Date('2020-01-01'),
} = {}) {

  return new CertificationCenterMembership({
    id,
    certificationCenter,
    user,
    createdAt,
  });
};
