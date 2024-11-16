class CampaignProfilesCollectionParticipationSummary {
  #previousPixScore;

  constructor({
    campaignParticipationId,
    firstName,
    lastName,
    participantExternalId,
    sharedAt,
    pixScore,
    sharedProfileCount,
    previousPixScore,
    certifiable,
    certifiableCompetencesCount,
  }) {
    this.id = campaignParticipationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.pixScore = pixScore;
    this.sharedProfileCount = sharedProfileCount;
    this.#previousPixScore = previousPixScore ?? null;
    this.evolution = this.#computeEvolution(this.pixScore, this.#previousPixScore);
    this.certifiable = certifiable;
    this.certifiableCompetencesCount = certifiableCompetencesCount;
  }

  #computeEvolution(actualValue, previousValue) {
    if ([actualValue, previousValue].includes(null)) return null;
    if (actualValue > previousValue) return 'increase';
    if (actualValue < previousValue) return 'decrease';
    if (actualValue === previousValue) return 'stable';
  }
}

export { CampaignProfilesCollectionParticipationSummary };
