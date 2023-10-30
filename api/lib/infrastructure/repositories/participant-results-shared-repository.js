import { knex } from '../../../db/knex-database-connection.js';
import { ParticipantResultsShared } from '../../../lib/domain/models/ParticipantResultsShared.js';
import * as placementProfileService from '../../domain/services/placement-profile-service.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as campaignRepository from './campaign-repository.js';

async function _fetchKnowledgeElements(campaignParticipationId) {
  const { snapshot: knowledgeElements } = await knex('campaign-participations')
    .select('snapshot')
    .join('knowledge-element-snapshots', function () {
      this.on('knowledge-element-snapshots.userId', '=', 'campaign-participations.userId').andOn(
        'knowledge-element-snapshots.snappedAt',
        '=',
        'campaign-participations.sharedAt',
      );
    })
    .where('campaign-participations.id', campaignParticipationId)
    .first();
  return knowledgeElements;
}

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
    const knowledgeElements = await _fetchKnowledgeElements(campaignParticipationId);
    const { userId, sharedAt } = await _fetchUserIdAndSharedAt(campaignParticipationId);
    const competences = await competenceRepository.listPixCompetencesOnly();

    const placementProfile = await placementProfileService.getPlacementProfileWithSnapshotting({
      userId,
      limitDate: sharedAt,
      allowExcessPixAndLevels: false,
      competences,
    });

    return new ParticipantResultsShared({
      campaignParticipationId,
      knowledgeElements,
      skillIds,
      placementProfile,
    });
  },
};

export { participantResultsSharedRepository };
