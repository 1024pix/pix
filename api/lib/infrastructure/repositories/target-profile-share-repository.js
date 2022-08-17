const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  async addTargetProfilesToOrganization({ organizationId, targetProfileIdList }) {
    const targetProfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
      return { organizationId, targetProfileId };
    });
    await knex('target-profile-shares')
      .insert(targetProfileShareToAdd)
      .onConflict(['targetProfileId', 'organizationId'])
      .ignore();
  },
};
