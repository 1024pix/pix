import User from '../../../../lib/domain/models/User';
import CertificationCenterMembership from '../../../../lib/domain/models/CertificationCenterMembership';
import buildCertificationCenter from './build-certification-center';

function _buildUser() {
  return new User({
    id: 456,
    firstName: 'Bertrand',
    lastName: 'Nolan',
    email: 'bertrand.nolan@example.net',
  });
}

export default function buildCertificationCenterMembership({
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
}
