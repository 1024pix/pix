import { databaseBuffer } from '../database-buffer.js';

const TABLE_NAME = 'data-protection-officers';

/**
 * @typedef {Object} DataProtectionOfficerBase
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {DataProtectionOfficerBase & { certificationCenterId: number }} CertificationCenterDataProtectionOfficer
 */

/**
 * @typedef {DataProtectionOfficerBase & { organizationId: number }} OrganizationDataProtectionOfficer
 */

/**
 * @param {Object} params
 * @param {number} [params.id]
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.email
 * @param {number} params.certificationCenterId
 * @param {Date} [params.createdAt]
 * @param {Date} [params.updatedAt]
 * @returns {CertificationCenterDataProtectionOfficer}
 */
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

/**
 * @param {Object} params
 * @param {number} [params.id]
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {string} params.email
 * @param {number} params.organizationId
 * @param {Date} [params.createdAt]
 * @param {Date} [params.updatedAt]
 * @returns {OrganizationDataProtectionOfficer}
 */
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

export {
  buildCertificationCenterDataProtectionOfficer as withCertificationCenterId,
  buildOrganizationDataProtectionOfficer as withOrganizationId,
};
