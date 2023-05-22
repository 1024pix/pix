class CampaignParticipantActivity {
  constructor({ campaignParticipationId, userId, firstName, lastName, participantExternalId, sharedAt, status } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.status = status;
  }
}

export { CampaignParticipantActivity };
