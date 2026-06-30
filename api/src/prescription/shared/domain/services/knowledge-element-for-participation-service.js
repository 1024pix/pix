import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';
import * as injectedKnowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedKnowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { KnowledgeElementCollection } from '../models/KnowledgeElementCollection.js';

class KnowledgeElementForParticipationService {
  constructor({
    campaignRepository = injectedCampaignRepository,
    knowledgeElementSnapshotRepository = injectedKnowledgeElementSnapshotRepository,
    knowledgeElementRepository = injectedKnowledgeElementRepository,
  } = {}) {
    this.campaignRepository = campaignRepository;
    this.knowledgeElementRepository = knowledgeElementRepository;
    this.knowledgeElementSnapshotRepository = knowledgeElementSnapshotRepository;
  }

  async save({ knowledgeElements, campaignParticipationId }) {
    const campaign = await this.campaignRepository.getByCampaignParticipationId(campaignParticipationId);
    if (!campaign) {
      throw new Error(`Invalid campaign participation ${campaignParticipationId}`);
    }
    if (campaign.isAssessment) {
      await this.knowledgeElementRepository.batchSave({ knowledgeElements });
      return;
    }

    if (campaign.isExam) {
      const currentSnapshot = await this.knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
      ]);
      const createdAt = new Date();
      const previousKnowledgeElements = currentSnapshot[campaignParticipationId] ?? [];

      const knowledgeElementToSave = previousKnowledgeElements.concat(
        knowledgeElements.map(
          (ke) =>
            new KnowledgeElement({
              ...ke,
              createdAt,
            }),
        ),
      );

      await this.knowledgeElementSnapshotRepository.save({
        snapshot: new KnowledgeElementCollection(knowledgeElementToSave).toSnapshot(),
        campaignParticipationId,
      });
      return;
    }

    throw new Error(`Saving knowledge-elements for campaign of type ${campaign.type} not implemented`);
  }

  async findUniqByUserOrCampaignParticipationId({ userId, campaignParticipationId, limitDate }) {
    const campaign = await this.campaignRepository.getByCampaignParticipationId(campaignParticipationId);

    if (!campaign) {
      throw new Error(`Invalid campaign participation ${campaignParticipationId}`);
    }

    if (campaign.isProfilesCollection || campaign.isAssessment) {
      return this.knowledgeElementRepository.findUniqByUserId({ userId, limitDate });
    }

    if (campaign.isExam) {
      const currentSnapshot = await this.knowledgeElementSnapshotRepository.findByCampaignParticipationIds([
        campaignParticipationId,
      ]);

      const currentKnowledgeElements = currentSnapshot[campaignParticipationId] ?? [];

      return currentKnowledgeElements.map((ke) => new KnowledgeElement(ke));
    }

    throw new Error(`find knowledge-elements for campaign of type ${campaign.type} not implemented`);
  }

  async findUniqByUsersOrCampaignParticipationIds({ participationInfos, fetchFromSnapshot, skillIds }) {
    if (!fetchFromSnapshot) {
      const userIds = participationInfos.map(({ userId }) => userId);
      return skillIds?.length
        ? await this.knowledgeElementRepository.findUniqByUserIdsAndSkillIds({ userIds, skillIds })
        : await this.knowledgeElementRepository.findUniqByUserIds({ userIds });
    }

    return await this.knowledgeElementSnapshotRepository.findCampaignParticipationKnowledgeElementSnapshots(
      participationInfos.map(({ campaignParticipationId }) => campaignParticipationId),
    );
  }
}

const knowledgeElementService = new KnowledgeElementForParticipationService();

export default knowledgeElementService;
