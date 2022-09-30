const { knex } = require('../../../db/knex-database-connection');
const DomainTransaction = require('../DomainTransaction');

const DATA_PROTECTION_OFFICERS_TABLE_NAME = 'data-protection-officers';

async function batchAddDataProtectionOfficerToOrganization(
  organizationDataProtectionOfficer,
  domainTransaction = DomainTransaction.emptyTransaction()
) {
  await knex
    .batchInsert(DATA_PROTECTION_OFFICERS_TABLE_NAME, organizationDataProtectionOfficer)
    .transacting(domainTransaction.knexTransaction);
}

module.exports = {
  batchAddDataProtectionOfficerToOrganization,
};
