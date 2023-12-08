import { knex } from '../../../../db/knex-database-connection.js';

const isFeatureEnabledForOrganization = async function ({ organizationId, featureKey }) {
  const organizationFeature = await knex('organization-features')
    .join('features', function () {
      this.on('features.id', 'organization-features.featureId').andOnVal('features.key', featureKey);
    })
    .where({ organizationId })
    .first();
  return Boolean(organizationFeature);
};

export { isFeatureEnabledForOrganization };
