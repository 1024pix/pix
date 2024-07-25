import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { OrganizationLearner } from '../../../../../src/shared/domain/models/OrganizationLearner.js';

const findOneByUserIdAndOrganizationId = async function ({
  userId,
  organizationId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const organizationLearner = await knex('view-active-organization-learners')
    .transacting(domainTransaction)
    .where({ userId, organizationId })
    .first('*');
  if (!organizationLearner) return null;
  return new OrganizationLearner(organizationLearner);
};

export { findOneByUserIdAndOrganizationId };
