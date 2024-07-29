import { DataProtectionOfficer } from '../../../src/organizational-entities/domain/models/DataProtectionOfficer.js';
import { DomainTransaction } from '../DomainTransaction.js';

const DATA_PROTECTION_OFFICERS_TABLE_NAME = 'data-protection-officers';

async function batchAddDataProtectionOfficerToOrganization(organizationDataProtectionOfficer) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn.batchInsert(DATA_PROTECTION_OFFICERS_TABLE_NAME, organizationDataProtectionOfficer);
}

async function get({ organizationId = null, certificationCenterId = null }) {
  const knexConn = DomainTransaction.getConnection();
  const [dataProtectionOfficerRow] = await knexConn(DATA_PROTECTION_OFFICERS_TABLE_NAME)
    .where({ organizationId, certificationCenterId })
    .returning('*');

  if (!dataProtectionOfficerRow) return;

  return new DataProtectionOfficer(dataProtectionOfficerRow);
}

async function create(dataProtectionOfficer) {
  const knexConn = DomainTransaction.getConnection();
  const { firstName, lastName, email, organizationId, certificationCenterId } = dataProtectionOfficer;
  const query = knexConn(DATA_PROTECTION_OFFICERS_TABLE_NAME).insert({
    firstName,
    lastName,
    email,
    organizationId,
    certificationCenterId,
  });

  const [dataProtectionOfficerRow] = await query.returning('*');

  return new DataProtectionOfficer(dataProtectionOfficerRow);
}

async function update(dataProtectionOfficer) {
  const knexConn = DomainTransaction.getConnection();
  const { firstName, lastName, email, organizationId, certificationCenterId } = dataProtectionOfficer;
  const updatedAt = new Date();

  const query = knexConn(DATA_PROTECTION_OFFICERS_TABLE_NAME).update({
    firstName,
    lastName,
    email,
    updatedAt,
  });

  organizationId ? query.where({ organizationId }) : query.where({ certificationCenterId });

  const [dataProtectionOfficerRow] = await query.returning('*');

  return new DataProtectionOfficer(dataProtectionOfficerRow);
}

export { batchAddDataProtectionOfficerToOrganization, create, get, update };
