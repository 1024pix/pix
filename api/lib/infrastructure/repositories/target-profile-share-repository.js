const Bookshelf = require('../bookshelf');

module.exports = {

  addToOrganization({ organizationId, targetProfileIdList }) {
    const targetPorfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
      return { organizationId, targetProfileId };
    });
    return Bookshelf.knex.batchInsert('target-profile-shares', targetPorfileShareToAdd).then(() => undefined);
  },
};
