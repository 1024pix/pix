const _ = require('lodash');
const CampaignParticipation = require('../models/CampaignParticipation');

const { SHARED } = CampaignParticipation.statuses;

class CampaignParticipationOverview {

  constructor({
    id,
    createdAt,
    status,
    sharedAt,
    organizationName,
    assessmentState,
    campaignCode,
    campaignTitle,
    campaignArchivedAt,
    targetProfile,
    masteryPercentage,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = status === SHARED;
    this.sharedAt = sharedAt;
    this.targetProfileId = targetProfile.id;
    this.organizationName = organizationName;
    this.assessmentState = assessmentState;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
    this.campaignArchivedAt = campaignArchivedAt;
    this.targetProfile = targetProfile;
    this.masteryPercentage = masteryPercentage;
  }

  get validatedStagesCount() {
    if (_.isEmpty(this.targetProfile.stages) || !this.isShared) return null;

    const validatedStages = this._getReachableStages().filter((stage) => stage.threshold <= (this.masteryPercentage * 100));
    return validatedStages.length;
  }

  get totalStagesCount() {
    return this._getReachableStages().length;
  }

  _getReachableStages() {
    return this.targetProfile.stages.filter((stage) => stage.threshold > 0);
  }
}

module.exports = CampaignParticipationOverview;
