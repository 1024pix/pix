const { knex } = require('../../../db/knex-database-connection');
const CampaignCreator = require('../../../lib/domain/models/CampaignCreator');
const organizationService = require('../../domain/services/organization-service');
const { UserNotAuthorizedToCreateCampaignError } = require('../../domain/errors');

async function get(userId, organizationId) {
  await _checkUserIsAMemberOfOrganization(organizationId, userId);
  const { canCollectProfiles } = await knex('organizations')
    .where({ id: organizationId })
    .select('canCollectProfiles')
    .first();
  const availableTargetProfiles = await organizationService.findAllTargetProfilesAvailableForOrganization(
    organizationId
  );
  const availableTargetProfilesIds = availableTargetProfiles.map(({ id }) => id);
  return new CampaignCreator(availableTargetProfilesIds, canCollectProfiles);
}

module.exports = {
  get,
};

async function _checkUserIsAMemberOfOrganization(organizationId, userId) {
  const membership = await knex('memberships').where({ organizationId, userId }).first();
  if (!membership) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}
