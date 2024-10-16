import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { OrganizationLearner } from '../../domain/read-models/OrganizationLearner.js';

async function getLearnersByFeature({ organizationId, featureId }) {
  const knexConn = DomainTransaction.getConnection();
  const rawOrganizationLearnerFeatures = await knexConn
    .select('*')
    .from('organization-learner-features')
    .join('organization-learners', 'organization-learners.id', 'organization-learner-features.organizationLearnerId')
    .where({ featureId, organizationId });

  return rawOrganizationLearnerFeatures.map(
    (rawOrganizationLearnerFeature) => new OrganizationLearner(rawOrganizationLearnerFeature),
  );
}

export { getLearnersByFeature };
