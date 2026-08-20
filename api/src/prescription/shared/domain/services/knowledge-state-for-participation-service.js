import * as injectedKnowledgeStateRepository from '../../../../shared/infrastructure/repositories/knowledge-state-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedKnowledgeStateSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-state-snapshot-repository.js';

/**
 * Route l'état de connaissance d'une participation vers sa source de vérité.
 *
 * Pour une campagne d'évaluation, c'est l'état vivant de l'utilisateur. Pour
 * une campagne EXAM, c'est l'instantané attaché à la participation : l'examen
 * est isolé du profil global, dans les deux sens.
 */
class KnowledgeStateForParticipationService {
  constructor({
    campaignRepository = injectedCampaignRepository,
    knowledgeStateSnapshotRepository = injectedKnowledgeStateSnapshotRepository,
    knowledgeStateRepository = injectedKnowledgeStateRepository,
  } = {}) {
    this.campaignRepository = campaignRepository;
    this.knowledgeStateRepository = knowledgeStateRepository;
    this.knowledgeStateSnapshotRepository = knowledgeStateSnapshotRepository;
  }

  /**
   * Enregistre l'état porté à ce point du parcours.
   *
   * @param {KnowledgeState} knowledgeState l'état après la réponse
   * @param {string[]} [tubeIds] les tubes que la réponse a fait bouger — seuls
   *   eux sont écrits sur l'état vivant ; l'instantané EXAM est réécrit entier
   */
  async save({ knowledgeState, tubeIds, userId, campaignParticipationId }) {
    const campaign = await this.campaignRepository.getByCampaignParticipationId(campaignParticipationId);
    if (!campaign) {
      throw new Error(`Invalid campaign participation ${campaignParticipationId}`);
    }
    if (campaign.isAssessment) {
      await this.knowledgeStateRepository.save({ userId, knowledgeState, tubeIds });
      return;
    }

    if (campaign.isExam) {
      await this.knowledgeStateSnapshotRepository.save({ knowledgeState, campaignParticipationId });
      return;
    }

    throw new Error(`Saving knowledge state for campaign of type ${campaign.type} not implemented`);
  }

  async findByUserOrCampaignParticipationId({ userId, campaignParticipationId, limitDate }) {
    const campaign = await this.campaignRepository.getByCampaignParticipationId(campaignParticipationId);

    if (!campaign) {
      throw new Error(`Invalid campaign participation ${campaignParticipationId}`);
    }

    if (campaign.isProfilesCollection || campaign.isAssessment) {
      return this.knowledgeStateRepository.findByUserId({ userId, limitDate });
    }

    if (campaign.isExam) {
      const snapshots = await this.knowledgeStateSnapshotRepository.findCampaignParticipationKnowledgeStates([
        campaignParticipationId,
      ]);

      return snapshots[0].knowledgeState;
    }

    throw new Error(`find knowledge state for campaign of type ${campaign.type} not implemented`);
  }

  /**
   * Les états d'un lot de participations : vivants, ou figés au partage.
   *
   * @returns {Promise<Array<{userId?: number, campaignParticipationId?: number, knowledgeState: KnowledgeState}>>}
   */
  async findByUsersOrCampaignParticipationIds({ participationInfos, fetchFromSnapshot }) {
    if (!fetchFromSnapshot) {
      const userIds = participationInfos.map(({ userId }) => userId);
      const statesByUserId = await this.knowledgeStateRepository.findByUserIds({ userIds });
      return userIds.map((userId) => ({ userId, knowledgeState: statesByUserId.get(userId) }));
    }

    return await this.knowledgeStateSnapshotRepository.findCampaignParticipationKnowledgeStates(
      participationInfos.map(({ campaignParticipationId }) => campaignParticipationId),
    );
  }
}

const knowledgeStateForParticipationService = new KnowledgeStateForParticipationService();

export default knowledgeStateForParticipationService;
