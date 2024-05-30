class CampaignParticipantActivity {
  constructor({
    campaignParticipationId,
    userId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
    status,
    lastCampaignParticipationId,
    participationCount,
  } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.status = status;
    this.lastCampaignParticipationId = lastCampaignParticipationId || campaignParticipationId;
    this.participationCount = participationCount || 0;
  }
}

export { CampaignParticipantActivity };
