import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

const batchAddTargetProfilesToOrganization = async function (
  organizationTargetProfiles,
  domainTransaction = DomainTransaction.emptyTransaction(),
) {
  await knex
    .batchInsert('target-profile-shares', organizationTargetProfiles)
    .transacting(domainTransaction.knexTransaction);
};

export { batchAddTargetProfilesToOrganization };
