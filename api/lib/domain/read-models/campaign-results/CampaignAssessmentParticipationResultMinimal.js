class CampaignAssessmentParticipationResultMinimal {
  constructor({
    campaignParticipationId,
    firstName,
    lastName,
    participantExternalId,
    masteryPercentage,
    badges = [],
  } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.masteryPercentage = masteryPercentage;
    this.badges = badges;
  }
}

module.exports = CampaignAssessmentParticipationResultMinimal;
