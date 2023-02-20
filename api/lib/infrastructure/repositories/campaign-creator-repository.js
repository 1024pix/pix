import { knex } from '../../../db/knex-database-connection';
import CampaignCreator from '../../../lib/domain/models/CampaignCreator';
import { UserNotAuthorizedToCreateCampaignError } from '../../domain/errors';

async function get({ userId, organizationId, ownerId }) {
  await _checkUserIsAMemberOfOrganization({ organizationId, userId });
  await _checkOwnerIsAMemberOfOrganization({ organizationId, ownerId });

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
  return new CampaignCreator(availableTargetProfiles);
}

export default {
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

async function _checkOwnerIsAMemberOfOrganization({ organizationId, ownerId }) {
  const membership = await knex('memberships').where({ organizationId, userId: ownerId }).first();
  if (!membership) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `Owner does not have an access to the organization ${organizationId}`
    );
  }
}
