class CampaignProfilesCollectionParticipationSummary {
  constructor({
    campaignParticipationId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
  }) {
    this.id = campaignParticipationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
  }
}

module.exports = CampaignProfilesCollectionParticipationSummary;
