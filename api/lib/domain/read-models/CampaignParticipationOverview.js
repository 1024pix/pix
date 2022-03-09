const _ = require('lodash');
const CampaignParticipationStatuses = require('../models/CampaignParticipationStatuses');

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
    targetProfile,
    masteryRate,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = status === SHARED;
    this.sharedAt = sharedAt;
    this.targetProfileId = targetProfile?.id;
    this.organizationName = organizationName;
    this.status = status;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
    this.targetProfile = targetProfile;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;

    const dates = [deletedAt, campaignArchivedAt].filter((a) => a != null);

    this.disabledAt = _.min(dates) || null;
  }

  get validatedStagesCount() {
    if (_.isEmpty(this.targetProfile?.stages) || !this.isShared) return null;

    const validatedStages = this._getReachableStages().filter((stage) => stage.threshold <= this.masteryRate * 100);
    return validatedStages.length;
  }

  get totalStagesCount() {
    return this._getReachableStages()?.length ?? 0;
  }

  _getReachableStages() {
    return this.targetProfile?.stages.filter((stage) => stage.threshold > 0);
  }
}

module.exports = CampaignParticipationOverview;
