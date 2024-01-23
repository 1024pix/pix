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
    participationCount,
  } = {}) {
    this.campaignParticipationId = campaignParticipationId;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.status = status;
    this.lastSharedOrCurrentCampaignParticipationId = lastSharedCampaignParticipationId || campaignParticipationId;
    this.participationCount = participationCount || 0;
  }
}

export { CampaignParticipantActivity };
