const databaseBuffer = require('../database-buffer');

const TABLE_NAME = 'data-protection-officers';

function buildCertificationCenterDataProtectionOfficer({
  id = databaseBuffer.getNextId(),
  firstName,
  lastName,
  email,
  certificationCenterId,
  createdAt = new Date(),
  updatedAt = new Date(),
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
  createdAt = new Date(),
  updatedAt = new Date(),
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

module.exports = {
  withCertificationCenterId: buildCertificationCenterDataProtectionOfficer,
  withOrganizationId: buildOrganizationDataProtectionOfficer,
};
