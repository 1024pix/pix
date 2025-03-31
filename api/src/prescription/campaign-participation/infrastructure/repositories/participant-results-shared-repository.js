import { knex } from '../../../../../db/knex-database-connection.js';
import * as campaignRepository from '../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { ParticipantResultsShared } from '../../domain/models/ParticipantResultsShared.js';
import * as campaignParticipationRepository from './campaign-participation-repository.js';

const save = async function ({ participantResultsShared }) {
  await knex('campaign-participations').update(participantResultsShared).where({ id: participantResultsShared.id });
};

const get = async function ({ campaignParticipationId, campaignsAPI, knowledgeElementSnapshotAPI }) {
  let knowledgeElements;
  const campaign = await campaignsAPI.getByCampaignParticipationId(campaignParticipationId);
  const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
    campaignParticipationId,
  });

  if (campaign.isExam) {
    const results = await knowledgeElementSnapshotAPI.getByParticipation(campaignParticipationId);

    knowledgeElements = results.knowledgeElements;
  } else {
    const results = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([campaignParticipationId]);

    knowledgeElements = results[campaignParticipationId];
  }
  const competences = await competenceRepository.listPixCompetencesOnly();
  const { userId, sharedAt, id } = await campaignParticipationRepository.get(campaignParticipationId);

  const [placementProfile] = await placementProfileService.getPlacementProfilesWithSnapshotting({
    participations: [{ userId, sharedAt, campaignParticipationId: id }],
    competences,
    allowExcessPixAndLevels: false,
  });

  return new ParticipantResultsShared({
    campaignParticipationId,
    knowledgeElements,
    skillIds,
    placementProfile,
  });
};

export { get, save };
