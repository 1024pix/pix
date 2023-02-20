import { knex } from '../../../db/knex-database-connection';
import DataProtectionOfficer from '../../domain/models/DataProtectionOfficer';
import DomainTransaction from '../DomainTransaction';

const DATA_PROTECTION_OFFICERS_TABLE_NAME = 'data-protection-officers';

async function batchAddDataProtectionOfficerToOrganization(
  organizationDataProtectionOfficer,
  domainTransaction = DomainTransaction.emptyTransaction()
) {
  await knex
    .batchInsert(DATA_PROTECTION_OFFICERS_TABLE_NAME, organizationDataProtectionOfficer)
    .transacting(domainTransaction.knexTransaction);
}

async function get({ organizationId = null, certificationCenterId = null }) {
  const [dataProtectionOfficerRow] = await knex(DATA_PROTECTION_OFFICERS_TABLE_NAME)
    .where({ organizationId, certificationCenterId })
    .returning('*');

  if (!dataProtectionOfficerRow) return;

  return new DataProtectionOfficer(dataProtectionOfficerRow);
}

async function create(dataProtectionOfficer, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const { firstName, lastName, email, organizationId, certificationCenterId } = dataProtectionOfficer;
  const query = knex(DATA_PROTECTION_OFFICERS_TABLE_NAME).insert({
    firstName,
    lastName,
    email,
    organizationId,
    certificationCenterId,
  });

  if (knexTransaction) query.transacting(knexTransaction);

  const [dataProtectionOfficerRow] = await query.returning('*');

  return new DataProtectionOfficer(dataProtectionOfficerRow);
}

async function update(dataProtectionOfficer) {
  const { firstName, lastName, email, organizationId, certificationCenterId } = dataProtectionOfficer;
  const updatedAt = new Date();

  const query = knex(DATA_PROTECTION_OFFICERS_TABLE_NAME).update({
    firstName,
    lastName,
    email,
    updatedAt,
  });

  if (organizationId) query.where({ organizationId });
  else query.where({ certificationCenterId });

  const [dataProtectionOfficerRow] = await query.returning('*');

  return new DataProtectionOfficer(dataProtectionOfficerRow);
}

export default {
  batchAddDataProtectionOfficerToOrganization,
  create,
  get,
  update,
};
