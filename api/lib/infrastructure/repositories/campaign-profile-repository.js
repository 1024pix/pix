const CampaignProfile = require('../../../lib/domain/read-models/CampaignProfile');
const placementProfileService = require('../../domain/services/placement-profile-service');
const { NotFoundError } = require('../../../lib/domain/errors');
const { knex } = require('../../../db/knex-database-connection');
const competenceRepository = require('./competence-repository');
const areaRepository = require('./area-repository');

module.exports = {
  async findProfile({ campaignId, campaignParticipationId, locale }) {
    const profile = await _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId);
    const competences = await competenceRepository.listPixCompetencesOnly({ locale });
    const allAreas = await areaRepository.list({ locale });

    const { sharedAt, userId } = profile;
    const placementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
      userId,
      limitDate: sharedAt,
      allowExcessPixAndLevels: false,
      competences,
    });

    return new CampaignProfile({ ...profile, placementProfile, allAreas });
  },
};

async function _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {
  const [profile] = await knex
    .with('campaignProfile', (qb) => {
      qb.select([
        'campaign-participations.userId',
        'organization-learners.firstName',
        'organization-learners.lastName',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.createdAt',
        'campaign-participations.sharedAt',
        'campaign-participations.status',
        'campaign-participations.participantExternalId',
        'campaign-participations.pixScore',
      ])
        .from('campaign-participations')
        .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
        .where({
          campaignId,
          'campaign-participations.id': campaignParticipationId,
          'campaign-participations.deletedAt': null,
        });
    })
    .from('campaignProfile');

  if (profile == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return profile;
}
