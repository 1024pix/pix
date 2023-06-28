import { knex } from '../../../../../db/knex-database-connection.js';

const addFeatureToOrganization = function ({ organizationId, featureKey }) {
  return knex('organization-features')
    .insert({
      organizationId,
      featureId: function () {
        return this.select('id').from('features').where({ key: featureKey });
      },
    })
    .onConflict()
    .ignore();
};

const removeFeatureToOrganization = function ({ organizationId, featureKey }) {
  return knex('organization-features')
    .where({
      organizationId,
      featureId: function () {
        return this.select('id').from('features').where({ key: featureKey });
      },
    })
    .delete();
};

const getFeaturesListFromOrganization = async function (organizationId) {
  return knex('features')
    .select('key')
    .join('organization-features', function () {
      this.on('featureId', 'features.id').andOn('organization-features.organizationId', organizationId);
    })
    .pluck('key');
};

export { addFeatureToOrganization, removeFeatureToOrganization, getFeaturesListFromOrganization };
