import { databaseBuffer } from '../database-buffer.js';

const TABLE_NAME = 'data-protection-officers';

/**
 * @typedef {{
 *  id: number,
 *  firstName: string,
 *  lastName: string,
 *  email: string,
 *  certificationCenterId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 * }} CertificationCenter
 */

/**
 * @typedef {{
 *  id: number,
 *  firstName: string,
 *  lastName: string,
 *  email: string,
 *  certificationCenterId: number,
 *  createdAt: Date,
 *  updatedAt: Date,
 * }} Organization
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

/**
 * @typedef {{
 *    withCertificationCenterId: function(Partial<CertificationCenter>): CertificationCenter,
 *    withOrganizationId: function(Partial<Organization>): Organization,
 * }} BuildDataProtectionOfficerFactory
 */
export {
  buildCertificationCenterDataProtectionOfficer as withCertificationCenterId,
  buildOrganizationDataProtectionOfficer as withOrganizationId,
};
