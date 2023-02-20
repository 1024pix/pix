import CertificationCenterInvitation from '../../../../lib/domain/models/CertificationCenterInvitation';

export default function buildCertificationCenterInvitation({
  id = 123,
  certificationCenterId = 456,
  email = 'userInvited@example.net',
  status = CertificationCenterInvitation.StatusType.PENDING,
  code = 'ABCDE12345',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  return new CertificationCenterInvitation({
    id,
    certificationCenterId,
    email,
    status,
    code,
    createdAt,
    updatedAt,
  });
}
