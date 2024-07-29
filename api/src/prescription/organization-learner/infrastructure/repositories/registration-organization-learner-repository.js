import { OrganizationLearner } from '../../../../../src/shared/domain/models/OrganizationLearner.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const findOneByUserIdAndOrganizationId = async function ({ userId, organizationId }) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearner = await knexConn('view-active-organization-learners')
    .where({ userId, organizationId })
    .first('*');
  if (!organizationLearner) return null;
  return new OrganizationLearner(organizationLearner);
};

export { findOneByUserIdAndOrganizationId };
