import {
  CombinedCourseParticipationStatuses,
  CombinedCourseStatuses,
} from '../../../../../prescription/shared/domain/constants.js';
import { config } from '../../../../../shared/config.js';
import { cryptoService as injectedCryptoService } from '../../../../../shared/domain/services/crypto-service.js';
import { CombinedCourse } from '../../combined-courses/entities/CombinedCourse.js';
import { DataForQuest } from '../../quests/aggregates/DataForQuest.js';
import { Eligibility } from '../../quests/aggregates/Eligibility.js';
import { TYPES } from '../../quests/value-objects/Requirement.js';
import {
  CampaignCombinedCourseItem,
  COMBINED_COURSE_ITEM_TYPES,
  ModuleCombinedCourseItem,
  TrainingCombinedCourseItem,
} from '../value-objects/CombinedCourseItem.js';
import { CombinedCourseParticipationDetails } from './CombinedCourseParticipationDetails.js';
import { CombinedCourseReward } from './CombinedCourseReward.js';

export class CombinedCourseDetails extends CombinedCourse {
  campaigns = [];
  modules = [];
  recommendableModuleIds = [];
  recommendedModuleIdsForUser = [];
  cryptoService = null;
  items = [];
  #combinedCourseUrl = null;
  #participation = null;
  dataForQuest = null;
  reward = null;

  constructor(
    { id, code, organizationId, name, description, illustration, questId, baseSurveyUrl },
    quest,
    cryptoService = injectedCryptoService,
  ) {
    super({ id, code, organizationId, name, description, illustration, questId, baseSurveyUrl }, quest);
    this.cryptoService = cryptoService;
  }

  async setEncryptedUrl() {
    this.#combinedCourseUrl = await this.cryptoService.encrypt('/parcours/' + this.code, config.module.secret);
  }

  setRecommandableModuleIds(recommendableModuleIds) {
    this.recommendableModuleIds = recommendableModuleIds;
  }

  setItems({ campaigns, modules }) {
    this.campaigns = campaigns;
    this.modules = modules;
  }

  get hasCampaigns() {
    return this.campaignIds.length > 0;
  }

  get hasModules() {
    return this.moduleIds.length > 0;
  }

  get hasParticipation() {
    return this.#participation !== null;
  }

  get campaignIds() {
    return this.quest.successRequirements
      .filter((requirement) => requirement.requirement_type === TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS)
      .map(({ data }) => data.campaignId.data);
  }

  get moduleIds() {
    return this.quest.successRequirements
      .filter((requirement) => requirement.requirement_type === TYPES.OBJECT.PASSAGES)
      .map(({ data }) => data.moduleId.data);
  }

  get participation() {
    return this.#participation;
  }

  get participationDetails() {
    return new CombinedCourseParticipationDetails({
      id: this.#participation.id,
      status: this.status,
      firstName: this.#participation.firstName,
      lastName: this.#participation.lastName,
      division: this.#participation.division,
      group: this.#participation.group,
      createdAt: this.#participation.createdAt,
      updatedAt: this.#participation.updatedAt,
      hasFormationItem: this.items.some(({ type }) => type === COMBINED_COURSE_ITEM_TYPES.FORMATION),
      nbCampaigns: this.items.filter(({ type }) => type === COMBINED_COURSE_ITEM_TYPES.CAMPAIGN).length,
      nbModules: this.items.filter(
        ({ type }) => type === COMBINED_COURSE_ITEM_TYPES.MODULE || type === COMBINED_COURSE_ITEM_TYPES.FORMATION,
      ).length,
      nbModulesCompleted: this.items.filter(
        ({ isCompleted, type }) => isCompleted && type === COMBINED_COURSE_ITEM_TYPES.MODULE,
      ).length,
      nbCampaignsCompleted: this.items.filter(
        ({ isCompleted, type }) => isCompleted && type === COMBINED_COURSE_ITEM_TYPES.CAMPAIGN,
      ).length,
    });
  }

  #createCampaignCombinedCourseItem({
    campaign,
    participationStatus,
    isCompleted,
    isLocked,
    masteryRate,
    totalStagesCount,
    validatedStagesCount,
  }) {
    return new CampaignCombinedCourseItem({
      id: campaign.id,
      reference: campaign.code,
      title: campaign.title,
      masteryRate: isCompleted ? masteryRate : null,
      participationStatus,
      isCompleted,
      isLocked,
      totalStagesCount: isCompleted ? totalStagesCount : null,
      validatedStagesCount: isCompleted ? validatedStagesCount : null,
    });
  }

  #createModuleCombinedCourseItem(module, participationStatus, isCompleted, isLocked) {
    return new ModuleCombinedCourseItem({
      id: module.id,
      reference: module.slug,
      title: module.title,
      redirection: this.#combinedCourseUrl,
      participationStatus,
      isCompleted,
      isLocked,
      duration: module?.duration,
      image: module.image,
      shortId: module.shortId,
    });
  }

  #createTrainingCombinedCourseItem(targetProfileId) {
    return new TrainingCombinedCourseItem({
      id: 'formation_' + this.quest.id + '_' + targetProfileId,
      reference: targetProfileId,
    });
  }

  #createTrainingCombinedCourseItemIfNeeded(recommendableModule, targetProfileIdsThatNeedAFormationItem) {
    const targetProfileId = targetProfileIdsThatNeedAFormationItem.find((targetProfileIdOfCampaign) =>
      recommendableModule.targetProfileIds.includes(targetProfileIdOfCampaign),
    );

    const shouldBeInFormationItem = Boolean(targetProfileId);
    const hasFormationItem = this.items.find((item) => {
      if (item.type !== COMBINED_COURSE_ITEM_TYPES.FORMATION) return false;
      if (item.reference === targetProfileId) return true;
      return false;
    });
    if (shouldBeInFormationItem) {
      if (!hasFormationItem) {
        return this.#createTrainingCombinedCourseItem(targetProfileId);
      } else {
        return undefined;
      }
    }
  }

  #isCombinedCourseItemLocked(previousItem) {
    if (!previousItem) {
      return false;
    }
    if (previousItem.isLocked) {
      return true;
    } else {
      return !previousItem.isCompleted;
    }
  }

  updateItemsFromPassages(passages) {
    const updatedDataForQuest = new DataForQuest({
      eligibility: new Eligibility({
        organizationLearner: this.dataForQuest.eligibility.organizationLearner,
        organization: this.dataForQuest.eligibility.organization,
        campaignParticipations: this.dataForQuest.eligibility.campaignParticipations,
        passages,
      }),
    });
    this.#generateItems({
      dataForQuest: updatedDataForQuest,
      participation: this.#participation,
    });
    return this;
  }

  get status() {
    if (!this.#participation) {
      return CombinedCourseStatuses.NOT_STARTED;
    } else {
      return this.#participation.status === CombinedCourseParticipationStatuses.STARTED
        ? CombinedCourseStatuses.STARTED
        : CombinedCourseStatuses.COMPLETED;
    }
  }

  #generateItems({ dataForQuest } = {}) {
    this.items = [];
    this.dataForQuest = dataForQuest;

    const targetProfileIdsThatNeedAFormationItem = [];

    for (const requirement of this.quest.successRequirements) {
      const previousItem = this.items[this.items.length - 1];
      const isLocked = this.#isCombinedCourseItemLocked(previousItem);

      if (requirement.requirement_type === TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS) {
        const isCompleted = dataForQuest ? requirement.isFulfilled(dataForQuest) : false;
        const campaign = this.campaigns.find((item) => item.id === requirement.data.campaignId.data);
        const associatedParticipation = dataForQuest?.campaignParticipations?.find(
          (campaignParticipation) => campaignParticipation.campaignId === campaign.id,
        );

        const participationStatus = associatedParticipation?.status;

        const doesCampaignRecommendModules =
          this.recommendableModuleIds.find((recommendableModule) => {
            if (!this.moduleIds.includes(recommendableModule.moduleId)) return false;
            return recommendableModule.targetProfileIds.includes(campaign.targetProfileId);
          }) ?? [];

        if (doesCampaignRecommendModules && !isCompleted) {
          targetProfileIdsThatNeedAFormationItem.push(campaign.targetProfileId);
        }

        this.items.push(
          this.#createCampaignCombinedCourseItem({
            campaign,
            participationStatus,
            isCompleted,
            isLocked,
            masteryRate: associatedParticipation?.masteryRate,
            validatedStagesCount: associatedParticipation?.validatedStagesCount,
            totalStagesCount: associatedParticipation?.totalStagesCount,
          }),
        );
      } else if (requirement.requirement_type === TYPES.OBJECT.PASSAGES) {
        const isCompleted = dataForQuest ? requirement.isFulfilled(dataForQuest) : false;
        const module = this.modules.find((item) => item.id === requirement.data.moduleId.data);
        const passage = dataForQuest?.passages.find((passage) => passage.moduleId === module.id);
        const participationStatus = passage?.status;

        const recommendableModule = this.recommendableModuleIds.find(
          (potentiallyRecommendedModule) => potentiallyRecommendedModule.moduleId === module.id,
        );
        const isRecommandable = Boolean(recommendableModule);

        if (!isRecommandable) {
          this.items.push(this.#createModuleCombinedCourseItem(module, participationStatus, isCompleted, isLocked));
          continue;
        }

        const isRecommended = this.recommendedModuleIdsForUser.find(
          (recommendedModule) => recommendedModule.moduleId === module.id,
        );

        if (isRecommended) {
          this.items.push(this.#createModuleCombinedCourseItem(module, participationStatus, isCompleted, isLocked));
          continue;
        }

        const formationCombinedCourseItem = this.#createTrainingCombinedCourseItemIfNeeded(
          recommendableModule,
          targetProfileIdsThatNeedAFormationItem,
        );

        if (formationCombinedCourseItem) {
          this.items.push(formationCombinedCourseItem);
        }
      }
    }
  }

  setDataAndGenerateItems({
    recommendedModuleIdsForUser = [],
    dataForQuest,
    participation = null,
    reward = null,
  } = {}) {
    this.recommendedModuleIdsForUser = recommendedModuleIdsForUser;
    this.#participation = participation;
    this.#generateItems({ dataForQuest });
    this.reward = reward ? new CombinedCourseReward({ combinedCourseDetails: this, reward }) : null;
  }

  isSuccessful() {
    return this.quest.isSuccessful(this.dataForQuest);
  }

  get surveyUrl() {
    return this.#participation ? `${this.baseSurveyUrl}?participationId=${this.#participation.id}` : this.baseSurveyUrl;
  }
}
