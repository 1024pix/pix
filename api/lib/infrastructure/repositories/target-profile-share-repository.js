const { knex } = require('../bookshelf');

module.exports = {
  async addTargetProfilesToOrganization({ organizationId, targetProfileIdList }) {
    const targetProfileShareToAdd = targetProfileIdList.map((targetProfileId) => {
      return { organizationId, targetProfileId };
    });

    const insertedTargetProfileShares = await knex('target-profile-shares')
      .insert(targetProfileShareToAdd)
      .onConflict(['targetProfileId', 'organizationId'])
      .ignore()
      .returning('targetProfileId');

    const attachedTargetProfileIds = insertedTargetProfileShares.map(({ targetProfileId }) => targetProfileId);
    const duplicatedTargetProfileIds = targetProfileIdList.filter(
      (targetProfileId) => !attachedTargetProfileIds.includes(targetProfileId)
    );

    return { duplicatedIds: duplicatedTargetProfileIds, attachedIds: attachedTargetProfileIds };
  },
};
