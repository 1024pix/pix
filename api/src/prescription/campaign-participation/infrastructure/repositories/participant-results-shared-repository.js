import * as campaignRepository from '../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { ParticipantResultsShared } from '../../domain/models/ParticipantResultsShared.js';
import * as campaignParticipationRepository from './campaign-participation-repository.js';

const participantResultsSharedRepository = {
  async save(participantResultShared) {
    const knexConn = DomainTransaction.getConnection();
    await knexConn('campaign-participations').update(participantResultShared).where({ id: participantResultShared.id });
  },

  async get(campaignParticipationId) {
    const skillIds = await campaignRepository.findSkillIdsByCampaignParticipationId({
      campaignParticipationId,
    });
    const knowledgeElements = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
      campaignParticipationId,
    ]);
    const competences = await competenceRepository.listPixCompetencesOnly();
    const { userId, sharedAt, id } = await campaignParticipationRepository.get(campaignParticipationId);

    const [placementProfile] = await placementProfileService.getPlacementProfilesWithSnapshotting({
      participations: [{ userId, sharedAt, campaignParticipationId: id }],
      competences,
      allowExcessPixAndLevels: false,
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
