import { knex } from '../../../../../db/knex-database-connection.js';
import * as campaignRepository from '../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { ParticipantResultsShared } from '../../domain/models/ParticipantResultsShared.js';

function _fetchUserIdAndSharedAt(campaignParticipationId) {
  return knex('campaign-participations')
    .select('userId', 'sharedAt')
    .where('campaign-participations.id', campaignParticipationId)
    .first();
}

const participantResultsSharedRepository = {
  async save(participantResultShared) {
    await knex('campaign-participations').update(participantResultShared).where({ id: participantResultShared.id });
  },

  async get(campaignParticipationId) {
    const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
      campaignParticipationId,
    });
    const knowledgeElements = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
      campaignParticipationId,
    ]);
    const { userId, sharedAt } = await _fetchUserIdAndSharedAt(campaignParticipationId);
    const competences = await competenceRepository.listPixCompetencesOnly();

    const placementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
      userId,
      limitDate: sharedAt,
      allowExcessPixAndLevels: false,
      competences,
      campaignParticipationId,
    });

    return new ParticipantResultsShared({
      campaignParticipationId,
      knowledgeElements: knowledgeElements[campaignParticipationId],
      skillIds,
      placementProfile,
    });
  },
};

export { participantResultsSharedRepository };
