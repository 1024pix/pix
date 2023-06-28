import { CertificationCenterForAdmin } from '../../../../lib/shared/domain/models/CertificationCenterForAdmin.js';

const buildCertificationCenterForAdmin = function ({
  id = 1,
  name = 'name',
  type = CertificationCenterForAdmin.types.SUP,
  externalId = 'externalId',
  createdAt = new Date('2020-01-01'),
  updatedAt,
  dataProtectionOfficerFirstName,
  dataProtectionOfficerLastName,
  dataProtectionOfficerEmail,
  habilitations = [],
} = {}) {
  return new CertificationCenterForAdmin({
    id,
    name,
    type,
    externalId,
    updatedAt,
    createdAt,
    dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName,
    dataProtectionOfficerEmail,
    habilitations,
  });
};

export { buildCertificationCenterForAdmin };
