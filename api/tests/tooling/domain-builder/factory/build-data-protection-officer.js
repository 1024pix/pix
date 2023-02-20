import DataProtectionOfficer from '../../../../lib/domain/models/DataProtectionOfficer';

function _buildDataProtectionOfficer({
  id = 10001,
  firstName = 'Justin',
  lastName = 'Ptipeu',
  email = 'justin.ptipeu@example.net',
  organizationId,
  certificationCenterId,
  createdAt = new Date('2022-09-26T14:07:25Z'),
  updatedAt = new Date('2022-09-26T14:07:25Z'),
} = {}) {
  return new DataProtectionOfficer({
    id,
    firstName,
    lastName,
    email,
    organizationId,
    certificationCenterId,
    createdAt,
    updatedAt,
  });
}

function buildDataProtectionOfficerWithCertificationCenterId({
  id,
  firstName,
  lastName,
  email,
  certificationCenterId,
  createdAt,
  updatedAt,
} = {}) {
  return _buildDataProtectionOfficer({
    id,
    firstName,
    lastName,
    email,
    certificationCenterId,
    createdAt,
    updatedAt,
  });
}

function buildDataProtectionOfficerWithOrganizationId({
  id,
  firstName,
  lastName,
  email,
  organizationId,
  createdAt,
  updatedAt,
} = {}) {
  return _buildDataProtectionOfficer({
    id,
    firstName,
    lastName,
    email,
    organizationId,
    createdAt,
    updatedAt,
  });
}

export default {
  withCertificationCenterId: buildDataProtectionOfficerWithCertificationCenterId,
  withOrganizationId: buildDataProtectionOfficerWithOrganizationId,
};
