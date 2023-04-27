const { knex } = require('../../../../db/knex-database-connection.js');
module.exports = {
  addFeatureToOrganization(organizationId, key) {
    return knex('organization-features')
      .insert({
        organizationId,
        featureId: function () {
          return this.select('id').from('features').where({ key });
        },
      })
      .onConflict()
      .ignore();
  },

  removeFeatureToOrganization(organizationId, key) {
    return knex('organization-features')
      .where({
        organizationId,
        featureId: function () {
          return this.select('id').from('features').where({ key });
        },
      })
      .delete();
  },
};
