const { knex } = require('../bookshelf');

module.exports = {
  async addTargetProfilesToOrganization({ organizationId, targetProfileIdList }) {
    const targetProfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
      return { organizationId, targetProfileId };
    });

    const attachedTargetProfileIds = await knex('target-profile-shares')
      .insert(targetProfileShareToAdd)
      .onConflict(['targetProfileId', 'organizationId'])
      .ignore()
      .returning('targetProfileId');

    const duplicatedTargetProfileIds = targetProfileIdList.filter(
      (targetProfileId) => !attachedTargetProfileIds.includes(targetProfileId)
    );

    return { duplicatedIds: duplicatedTargetProfileIds, attachedIds: attachedTargetProfileIds };
  },
};
