const Bookshelf = require('../bookshelf');

module.exports = {

  addTargetProfilesToOrganization({ organizationId, targetProfileIdList }) {
    const targetProfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
      return { organizationId, targetProfileId };
    });
    return Bookshelf.knex.batchInsert('target-profile-shares', targetProfileShareToAdd)
      .then(() => null);
  },
};
