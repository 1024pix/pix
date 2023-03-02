const _ = require('lodash');
const CampaignParticipationStatuses = require('../models/CampaignParticipationStatuses.js');

const { SHARED } = CampaignParticipationStatuses;

class CampaignParticipationOverview {
  constructor({
    id,
    createdAt,
    sharedAt,
    organizationName,
    status,
    campaignCode,
    campaignTitle,
    campaignArchivedAt,
    deletedAt,
    masteryRate,
    validatedSkillsCount,
    stageCollection,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = status === SHARED;
    this.sharedAt = sharedAt;
    this.organizationName = organizationName;
    this.status = status;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
    this.stageCollection = stageCollection;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    this.validatedSkillsCount = validatedSkillsCount;

    const dates = [deletedAt, campaignArchivedAt].filter((a) => a != null);

    this.disabledAt = _.min(dates) || null;
  }

  get validatedStagesCount() {
    if (this.stageCollection.totalStages === 0 || !this.isShared) return null;

    return this.stageCollection.getReachedStage(this.validatedSkillsCount, this.masteryRate * 100).reachedStage;
  }

  get totalStagesCount() {
    return this.stageCollection.totalStages;
  }
}

module.exports = CampaignParticipationOverview;
