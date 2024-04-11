import { CertificationCenterMembership } from '../../../../lib/domain/models/CertificationCenterMembership.js';
import { User } from '../../../../src/shared/domain/models/User.js';
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
  role = 'MEMBER',
  updatedByUserId = 1,
  updatedAt = new Date('2023-09-12'),
} = {}) {
  return new CertificationCenterMembership({
    id,
    certificationCenter,
    user,
    createdAt,
    disabledAt,
    isReferer,
    role,
    updatedByUserId,
    updatedAt,
  });
};

export { buildCertificationCenterMembership };
