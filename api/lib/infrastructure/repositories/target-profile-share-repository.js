const { knex } = require('../bookshelf');

module.exports = {

  async addTargetProfilesToOrganization({ organizationId, targetProfileIdList }) {
    const targetProfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
      return { organizationId, targetProfileId };
    });

    return knex('target-profile-shares')
      .insert(targetProfileShareToAdd)
      .onConflict(['targetProfileId', 'organizationId'])
      .ignore();
  },
};
