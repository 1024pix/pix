import CampaignProfile from '../../../lib/domain/read-models/CampaignProfile';
import placementProfileService from '../../domain/services/placement-profile-service';
import { NotFoundError } from '../../../lib/domain/errors';
import { knex } from '../../../db/knex-database-connection';
import competenceRepository from './competence-repository';
import areaRepository from './area-repository';

export default {
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
