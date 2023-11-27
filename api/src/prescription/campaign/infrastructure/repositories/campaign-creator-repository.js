import { knex } from '../../../../../db/knex-database-connection.js';
import { CampaignCreator } from '../../domain/models/CampaignCreator.js';
import { UserNotAuthorizedToCreateCampaignError } from '../../../../../lib/domain/errors.js';

async function get({
  userId,
  organizationId,
  ownerId,
  shouldOwnerBeFromOrganization = true,
  shouldCreatorBeFromOrganization = true,
}) {
  if (shouldCreatorBeFromOrganization) {
    await _checkUserIsAMemberOfOrganization({ organizationId, userId });
  }
  if (shouldOwnerBeFromOrganization) {
    await _checkOwnerIsAMemberOfOrganization({ organizationId, ownerId });
  }

  const availableTargetProfileIds = await knex('target-profiles')
    .leftJoin('target-profile-shares', 'targetProfileId', 'target-profiles.id')
    .where({ outdated: false })
    .andWhere((queryBuilder) => {
      queryBuilder
        .where({ isPublic: true })
        .orWhere({ ownerOrganizationId: organizationId })
        .orWhere({ organizationId });
    })
    .pluck('target-profiles.id');

  const availableFeatures = await knex('features')
    .select('key', knex.raw('"organization-features"."organizationId" IS NOT NULL as enabled'))
    .leftJoin('organization-features', function () {
      this.on('features.id', 'organization-features.featureId').andOn(
        'organization-features.organizationId',
        organizationId,
      );
    });

  const organizationFeatures = availableFeatures.reduce(
    (features, { key, enabled }) => ({ ...features, [key]: enabled }),
    {},
  );

  return new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
}

export { get };

async function _checkUserIsAMemberOfOrganization({ organizationId, userId }) {
  const membership = await knex('memberships').where({ organizationId, userId }).first();
  if (!membership) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `User does not have an access to the organization ${organizationId}`,
    );
  }
}

async function _checkOwnerIsAMemberOfOrganization({ organizationId, ownerId }) {
  const membership = await knex('memberships').where({ organizationId, userId: ownerId }).first();
  if (!membership) {
    throw new UserNotAuthorizedToCreateCampaignError(
      `Owner does not have an access to the organization ${organizationId}`,
    );
  }
}
