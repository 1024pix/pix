import _ from 'lodash';

import { CampaignTypes } from '../../../prescription/shared/domain/constants.js';

class CampaignReport {
  constructor({
    id,
    name,
    code,
    title,
    externalIdLabel,
    externalIdType,
    createdAt,
    customLandingPageText,
    archivedAt,
    type,
    ownerId,
    ownerLastName,
    ownerFirstName,
    participationsCount,
    sharedParticipationsCount,
    averageResult,
    badges = [],
    stages = [],
    multipleSendings,
    targetProfileName,
  } = {}) {
    this.targetProfileName = targetProfileName;
    this.id = id;
    this.name = name;
    this.code = code;
    this.title = title;
    this.type = type;
    this.externalIdLabel = externalIdLabel;
    this.externalIdType = externalIdType;
    this.customLandingPageText = customLandingPageText;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.ownerId = ownerId;
    this.ownerLastName = ownerLastName;
    this.ownerFirstName = ownerFirstName;
    this.participationsCount = participationsCount;
    this.sharedParticipationsCount = sharedParticipationsCount;
    this.averageResult = averageResult;
    this.reachedStage = null;
    this.totalStage = null;
    this.badges = badges;
    this.stages = stages;
    this.multipleSendings = multipleSendings;
  }

  get isAssessment() {
    return this.type === CampaignTypes.ASSESSMENT;
  }

  get isExam() {
    return this.type === CampaignTypes.EXAM;
  }

  get isProfilesCollection() {
    return this.type === CampaignTypes.PROFILES_COLLECTION;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }

  setTargetProfileInformation(targetProfile) {
    this.targetProfileId = targetProfile.id;
    this.targetProfileDescription = targetProfile.description;
    this.targetProfileName = targetProfile.name;
    this.targetProfileTubesCount = targetProfile.tubeCount;
    this.targetProfileThematicResultCount = targetProfile.thematicResultCount;
    this.targetProfileHasStage = targetProfile.hasStage;
    this.targetProfileAreKnowledgeElementsResettable = targetProfile.areKnowledgeElementsResettable;
  }

  setBadges(badges) {
    this.badges = badges;
  }

  setStages(stageCollection) {
    this._stageCollection = stageCollection;
    this.stages = stageCollection.stages;
  }

  setCoverRate(campaignResultLevelsPerTubesAndCompetences) {
    this.tubes = campaignResultLevelsPerTubesAndCompetences.levelsPerTube;
  }

  computeAverageResult(masteryRates) {
    const totalMasteryRates = masteryRates.length;
    if (totalMasteryRates > 0) {
      this.averageResult = _.sum(masteryRates) / totalMasteryRates;
    } else this.averageResult = null;
  }

  computeReachedStage(validatedSkillsCounts) {
    const totalValidatedSkillsCounts = validatedSkillsCounts.length;
    let averageValidatedSkillsCount = 0;

    if (totalValidatedSkillsCounts > 0) {
      averageValidatedSkillsCount = _.sum(validatedSkillsCounts) / totalValidatedSkillsCounts;
    }

    if (this._stageCollection.hasStage) {
      const reachedStage = this._stageCollection.getReachedStage(averageValidatedSkillsCount, this.averageResult * 100);
      this.reachedStage = reachedStage.reachedStage;
      this.totalStage = reachedStage.totalStage;
    }
  }
}

export { CampaignReport };
