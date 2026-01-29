import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as areaRepository from '../../../../shared/infrastructure/repositories/area-repository.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { CampaignProfile } from '../../domain/models/CampaignProfile.js';
import * as campaignParticipationRepository from './campaign-participation-repository.js';

const findProfile = async function ({ campaignId, campaignParticipationId, locale }) {
  const profile = await _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId);
  const competences = await competenceRepository.listPixCompetencesOnly({ locale });
  const allAreas = await areaRepository.list({ locale });
  const { userId, sharedAt, id } = await campaignParticipationRepository.get(campaignParticipationId);

  const [placementProfile] = await placementProfileService.getPlacementProfilesWithSnapshotting({
    participations: [{ userId, sharedAt, campaignParticipationId: id }],
    competences,
    allowExcessPixAndLevels: false,
  });

  return new CampaignProfile({ ...profile, placementProfile, allAreas });
};

export { findProfile };

async function _fetchCampaignProfileAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {
  const knexConn = DomainTransaction.getConnection();
  const [profile] = await knexConn
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
