const Assessment = require('../models/Assessment');

class CampaignAssessmentParticipation {

  constructor({
    userId,
    firstName,
    lastName,
    campaignParticipationId,
    campaignId,
    participantExternalId,
    assessmentState,
    sharedAt,
    isShared,
    createdAt,
    targetedSkillsCount,
    validatedSkillsCount,
    testedSkillsCount,
    badges = [],
  }) {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.isShared = isShared;
    this.createdAt = createdAt;
    this.targetedSkillsCount = targetedSkillsCount;
    this.progression = this._computeProgression(assessmentState, testedSkillsCount);
    this.badges = badges;

    if (this.isShared) {
      this.validatedSkillsCount = validatedSkillsCount;
      this.masteryPercentage = this._computeMasteryPercentage();
    }
  }

  _computeMasteryPercentage() {
    if (this.targetedSkillsCount !== 0) {
      return Math.round(this.validatedSkillsCount * 100 / this.targetedSkillsCount);
    } else {
      return 0;
    }
  }

  _computeProgression(assessmentState, testedSkillsCount) {
    if (assessmentState === Assessment.states.COMPLETED) return 100;
    return Math.round(testedSkillsCount * 100 / this.targetedSkillsCount);
  }

  setBadges(badges) {
    this.badges = badges;
  }
}

module.exports = CampaignAssessmentParticipation;

