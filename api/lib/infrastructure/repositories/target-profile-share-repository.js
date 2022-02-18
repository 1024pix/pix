const { knex } = require('../bookshelf');

const { foreignKeyConstraintViolated } = require('../utils/knex-utils.js');
const { NotFoundError } = require('../../domain/errors');

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
  async attachOrganizations(targetProfile) {
    const rows = targetProfile.organizations.map((organizationId) => {
      return {
        organizationId,
        targetProfileId: targetProfile.id,
      };
    });
    const attachedOrganizationIds = await _createTargetProfileShares(rows);

    const duplicatedOrganizationIds = targetProfile.organizations.filter(
      (organizationId) => !attachedOrganizationIds.includes(organizationId)
    );

    return { duplicatedIds: duplicatedOrganizationIds, attachedIds: attachedOrganizationIds };
  },
};

async function _createTargetProfileShares(targetProfileShares) {
  try {
    return await knex('target-profile-shares')
      .insert(targetProfileShares)
      .onConflict(['targetProfileId', 'organizationId'])
      .ignore()
      .returning('organizationId');
  } catch (error) {
    if (foreignKeyConstraintViolated(error)) {
      const organizationId = error.detail.match(/=\((\d+)\)/)[1];
      throw new NotFoundError(`L'organization avec l'id ${organizationId} n'existe pas`);
    }
  }
}
