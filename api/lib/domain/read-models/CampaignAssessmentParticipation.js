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
    masteryPercentage,
    sharedAt,
    isShared,
    createdAt,
    targetedSkillsCount,
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
    this.progression = this._computeProgression(assessmentState, testedSkillsCount, targetedSkillsCount);
    this.badges = badges;
    this.masteryPercentage = Number(masteryPercentage) || 0;
  }

  _computeProgression(assessmentState, testedSkillsCount, targetedSkillsCount) {
    if (assessmentState === Assessment.states.COMPLETED) return 1;
    return Number((testedSkillsCount / targetedSkillsCount).toFixed(2));
  }

  setBadges(badges) {
    this.badges = badges;
  }
}

module.exports = CampaignAssessmentParticipation;

