const { knex } = require('../../../db/knex-database-connection');
const CampaignCreator = require('../../../lib/domain/models/CampaignCreator');
const { UserNotAuthorizedToCreateCampaignError } = require('../../domain/errors');

async function get({ userId, organizationId }) {
  await _checkUserIsAMemberOfOrganization({ organizationId, userId });
  const { canCollectProfiles } = await knex('organizations')
    .where({ id: organizationId })
    .select('canCollectProfiles')
    .first();

  const availableTargetProfiles = await knex('target-profiles')
    .leftJoin('target-profile-shares', 'targetProfileId', 'target-profiles.id')
    .where({ outdated: false })
    .andWhere((queryBuilder) => {
      queryBuilder
        .where({ isPublic: true })
        .orWhere({ ownerOrganizationId: organizationId })
        .orWhere({ organizationId });
    })
    .pluck('target-profiles.id');
  return new CampaignCreator(availableTargetProfiles, canCollectProfiles);
}

module.exports = {
  get,
};

async function _checkUserIsAMemberOfOrganization({ organizationId, userId }) {
  const membership = await knex('memberships').where({ organizationId, userId }).first();
  if (!membership) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}
