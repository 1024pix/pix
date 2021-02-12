const CampaignProfile = require('../../../lib/domain/read-models/CampaignProfile');
const placementProfileService = require('../../domain/services/placement-profile-service');
const { NotFoundError } = require('../../../lib/domain/errors');
const { knex } = require('../bookshelf');

module.exports = {
  async findProfile({ campaignId, campaignParticipationId, locale }) {

    const profile = await _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId);

    const { sharedAt, userId } = profile;
    const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: sharedAt, allowExcessPixAndLevels: false, locale });

    return new CampaignProfile({ ...profile, placementProfile });
  },
};

async function _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {

  const [profile] = await knex.with('campaignProfile',
    (qb) => {
      qb.select([
        'users.id AS userId',
        knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
        knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.createdAt',
        'campaign-participations.sharedAt',
        'campaign-participations.isShared',
        'campaign-participations.participantExternalId',
      ])
        .from('campaign-participations')
        .join('users', 'campaign-participations.userId', 'users.id')
        .leftJoin('schooling-registrations', 'campaign-participations.userId', 'schooling-registrations.userId')
        .leftJoin('campaigns', function() {
          this.on({ 'campaign-participations.campaignId': 'campaigns.id' })
            .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
        })
        .where({
          campaignId,
          'campaign-participations.id': campaignParticipationId,
        });
    })
    .from('campaignProfile');

  if (profile == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return profile;
}
