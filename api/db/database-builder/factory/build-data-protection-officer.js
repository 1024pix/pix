import databaseBuffer from '../database-buffer';

const TABLE_NAME = 'data-protection-officers';

function buildCertificationCenterDataProtectionOfficer({
  id = databaseBuffer.getNextId(),
  firstName,
  lastName,
  email,
  certificationCenterId,
  createdAt = new Date('2022-09-26T14:36:46Z'),
  updatedAt = new Date('2022-09-26T14:36:46Z'),
}) {
  const values = {
    id,
    firstName,
    lastName,
    email,
    certificationCenterId,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: TABLE_NAME,
    values,
  });
}

function buildOrganizationDataProtectionOfficer({
  id = databaseBuffer.getNextId(),
  firstName,
  lastName,
  email,
  organizationId,
  createdAt = new Date('2022-09-26T14:36:46Z'),
  updatedAt = new Date('2022-09-26T14:36:46Z'),
}) {
  const values = {
    id,
    firstName,
    lastName,
    email,
    organizationId,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: TABLE_NAME,
    values,
  });
}

export default {
  withCertificationCenterId: buildCertificationCenterDataProtectionOfficer,
  withOrganizationId: buildOrganizationDataProtectionOfficer,
};
