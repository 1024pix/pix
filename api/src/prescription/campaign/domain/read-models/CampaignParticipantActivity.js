class CampaignParticipantActivity {
  constructor({
    campaignParticipationId,
    userId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
    status,
    lastSharedCampaignParticipationId,
  } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.status = status;
    this.lastSharedOrCurrentCampaignParticipationId = lastSharedCampaignParticipationId || campaignParticipationId;
  }
}

export { CampaignParticipantActivity };
