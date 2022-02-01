const _ = require('lodash');

class CampaignAssessmentParticipationResultMinimal {
  constructor({ campaignParticipationId, firstName, lastName, participantExternalId, masteryRate, badges = [] } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.masteryRate = !_.isNil(masteryRate) ? Number(masteryRate) : null;
    this.badges = badges;
  }
}

module.exports = CampaignAssessmentParticipationResultMinimal;
