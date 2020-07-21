const CampaignProfile = require('../../../lib/domain/read-models/CampaignProfile');
const placementProfileService = require('../../domain/services/placement-profile-service');
const { NotFoundError } = require('../../../lib/domain/errors');
const Bookshelf = require('../bookshelf');

module.exports = {
  async findProfile(campaignId, campaignParticipationId) {

    const profile = await _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId);

    const { sharedAt, userId } = profile;
    const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate: sharedAt, allowExcessPixAndLevels: false });

    return new CampaignProfile({ ...profile, placementProfile });
  }
};

async function _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {

  const [profile] = await Bookshelf.knex.with('campaignProfile',
    (qb) => {
      qb.select([
        'users.id AS userId',
        'users.firstName',
        'users.lastName',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.createdAt',
        'campaign-participations.sharedAt',
        'campaign-participations.isShared',
        'campaign-participations.participantExternalId'
      ])
        .from('campaign-participations')
        .join('users', 'campaign-participations.userId', 'users.id')
        .where({
          campaignId,
          'campaign-participations.id': campaignParticipationId
        });
    })
    .from('campaignProfile');

  if (profile == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return profile;
}
