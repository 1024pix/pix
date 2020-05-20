const Assessment = require('../models/Assessment');

const statuses = {
  SHARED: 'shared',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
};

class CampaignAssessmentParticipationSummary {
  constructor({
    campaignParticipationId,
    userId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
    state,
    isShared,
    targetedSkillCount,
    validatedTargetedSkillCount,
  } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.status = this._getStatus(isShared, state);
    this.targetedSkillCount = targetedSkillCount;
    this.validatedTargetedSkillCount = validatedTargetedSkillCount;
    this.masteryPercentage = this._computeMasteryPercentage(isShared);
  }

  _computeMasteryPercentage(isShared) {
    if (!isShared) return undefined;
    if (this.targetedSkillCount !== 0) {
      return Math.round(this.validatedTargetedSkillCount * 100 / this.targetedSkillCount);
    } else {
      return 0;
    }
  }

  _getStatus(isShared, state) {
    if (isShared) return CampaignAssessmentParticipationSummary.statuses.SHARED;
    if (state === Assessment.states.COMPLETED) return CampaignAssessmentParticipationSummary.statuses.COMPLETED;
    return CampaignAssessmentParticipationSummary.statuses.ONGOING;
  }
}

CampaignAssessmentParticipationSummary.statuses = statuses;

module.exports = CampaignAssessmentParticipationSummary;
