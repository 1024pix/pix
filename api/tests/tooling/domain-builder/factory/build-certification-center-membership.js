import { User } from '../../../../lib/domain/models/User.js';
import { CertificationCenterMembership } from '../../../../lib/domain/models/CertificationCenterMembership.js';
import { buildCertificationCenter } from './build-certification-center.js';

function _buildUser() {
  return new User({
    id: 456,
    firstName: 'Bertrand',
    lastName: 'Nolan',
    email: 'bertrand.nolan@example.net',
  });
}

const buildCertificationCenterMembership = function ({
  id = 1,
  certificationCenter = buildCertificationCenter(),
  user = _buildUser(),
  createdAt = new Date('2020-01-01'),
  disabledAt,
  isReferer = false,
} = {}) {
  return new CertificationCenterMembership({
    id,
    certificationCenter,
    user,
    createdAt,
    disabledAt,
    isReferer,
  });
};

export { buildCertificationCenterMembership };
