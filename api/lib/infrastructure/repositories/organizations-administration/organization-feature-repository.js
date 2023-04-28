const { knex } = require('../../../../db/knex-database-connection.js');
module.exports = {
  addFeatureToOrganization({ organizationId, featureKey }) {
    return knex('organization-features')
      .insert({
        organizationId,
        featureId: function () {
          return this.select('id').from('features').where({ key: featureKey });
        },
      })
      .onConflict()
      .ignore();
  },

  removeFeatureToOrganization({ organizationId, featureKey }) {
    return knex('organization-features')
      .where({
        organizationId,
        featureId: function () {
          return this.select('id').from('features').where({ key: featureKey });
        },
      })
      .delete();
  },

  async getFeaturesListFromOrganization(organizationId) {
    return knex('features')
      .select('key')
      .join('organization-features', function () {
        this.on('featureId', 'features.id').andOn('organization-features.organizationId', organizationId);
      })
      .pluck('key');
  },
};
