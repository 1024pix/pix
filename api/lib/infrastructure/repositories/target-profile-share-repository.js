import { DomainTransaction } from '../DomainTransaction.js';

const batchAddTargetProfilesToOrganization = async function (organizationTargetProfiles) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn.batchInsert('target-profile-shares', organizationTargetProfiles);
};

export { batchAddTargetProfilesToOrganization };
