class CampaignProfilesCollectionParticipationSummary {
  constructor({
    campaignParticipationId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
    pixScore,
    certifiable,
    certifiableCompetencesCount,
  }) {
    this.id = campaignParticipationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.pixScore = pixScore;
    this.certifiable = certifiable;
    this.certifiableCompetencesCount = certifiableCompetencesCount;
  }
}

export { CampaignProfilesCollectionParticipationSummary };
