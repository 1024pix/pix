const _ = require('lodash');

class CampaignParticipationOverview {

  constructor({
    id,
    createdAt,
    isShared,
    sharedAt,
    validatedSkillsCount,
    organizationName,
    assessmentState,
    campaignCode,
    campaignTitle,
    campaignArchivedAt,
    targetProfile,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = isShared;
    this.sharedAt = sharedAt;
    this.targetProfileId = targetProfile.id;
    this.validatedSkillsCount = validatedSkillsCount;
    this.totalSkillsCount = targetProfile.skills.length;
    this.organizationName = organizationName;
    this.assessmentState = assessmentState;
    this.campaignCode = campaignCode;
    this.campaignTitle = campaignTitle;
    this.campaignArchivedAt = campaignArchivedAt;
    this.targetProfile = targetProfile;
  }

  get masteryPercentage() {
    if (!this.isShared) return null;

    if (this.totalSkillsCount === 0) return 0;

    return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
  }

  get validatedStagesCount() {
    if (_.isEmpty(this.targetProfile.stages) || !this.isShared) return null;

    const validatedStages = this.targetProfile.stages.filter((stage) => stage.threshold <= this.masteryPercentage);
    return validatedStages.length;
  }

  get totalStagesCount() {
    return this.targetProfile.stages.length;
  }
}

module.exports = CampaignParticipationOverview;
