const Assessment = require('../models/Assessment');

class CampaignAssessmentParticipation {

  constructor({
    firstName,
    lastName,
    campaignParticipationId,
    campaignId,
    participantExternalId,
    assessementState,
    sharedAt,
    isShared,
    createdAt,
    totalSkillsCount,
    validatedSkillsCount,
    testedSkillsCount,
    campaignAssessmentParticipationResult,
    campaignAnalysis,
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = isShared;
    this.createdAt = createdAt;
    this.totalSkillsCount = totalSkillsCount;
    this.campaignAssessmentParticipationResult = campaignAssessmentParticipationResult;
    this.campaignAnalysis = campaignAnalysis;
    this.progression = this._computeProgression(assessementState, testedSkillsCount);

    if (this.isShared) {
      this.validatedSkillsCount = validatedSkillsCount;
      this.masteryPercentage = this._computeMasteryPercentage(isShared);
    }
  }

  _computeMasteryPercentage() {
    if (this.totalSkillsCount !== 0) {
      return Math.round(this.validatedSkillsCount * 100 / this.totalSkillsCount);
    } else {
      return 0;
    }
  }

  _computeProgression(assessementState, testedSkillsCount) {
    if (assessementState === Assessment.states.COMPLETED) return 100;
    return Math.round(testedSkillsCount * 100 / this.totalSkillsCount);
  }
}

module.exports = CampaignAssessmentParticipation;

