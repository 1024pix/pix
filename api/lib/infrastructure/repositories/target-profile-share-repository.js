import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

const addTargetProfilesToOrganization = async function ({ organizationId, targetProfileIdList }) {
  const targetProfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
    return { organizationId, targetProfileId };
  });
  await knex('target-profile-shares')
    .insert(targetProfileShareToAdd)
    .onConflict(['targetProfileId', 'organizationId'])
    .ignore();
};

const batchAddTargetProfilesToOrganization = async function (
  organizationTargetProfiles,
  domainTransaction = DomainTransaction.emptyTransaction()
) {
  await knex
    .batchInsert('target-profile-shares', organizationTargetProfiles)
    .transacting(domainTransaction.knexTransaction);
};

export { addTargetProfilesToOrganization, batchAddTargetProfilesToOrganization };
