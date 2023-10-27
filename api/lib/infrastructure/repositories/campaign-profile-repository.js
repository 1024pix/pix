import { CampaignProfile } from '../../../lib/domain/read-models/CampaignProfile.js';
import * as placementProfileService from '../../domain/services/placement-profile-service.js';
import { NotFoundError } from '../../../lib/domain/errors.js';
import { knex } from '../../../db/knex-database-connection.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as areaRepository from './area-repository.js';

const findProfile = async function ({ campaignId, campaignParticipationId, locale }) {
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
};

export { findProfile };

async function _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {
  const [profile] = await knex
    .with('campaignProfile', (qb) => {
      qb.select([
        'campaign-participations.userId',
        'view-active-organization-learners.firstName',
        'view-active-organization-learners.id AS organizationLearnerId',
        'view-active-organization-learners.lastName',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.createdAt',
        'campaign-participations.sharedAt',
        'campaign-participations.status',
        'campaign-participations.participantExternalId',
        'campaign-participations.pixScore',
      ])
        .from('campaign-participations')
        .join(
          'view-active-organization-learners',
          'view-active-organization-learners.id',
          'campaign-participations.organizationLearnerId',
        )
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
