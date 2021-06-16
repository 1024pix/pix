class BadgeCriterion {

  constructor({
    id,
    scope,
    threshold,
    partnerCompetenceIds,
  } = {}) {
    this.id = id;
    this.scope = scope;
    this.threshold = threshold;
    this.partnerCompetenceIds = partnerCompetenceIds;
  }
}

BadgeCriterion.SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  SOME_PARTNER_COMPETENCES: 'SomePartnerCompetences',
};

module.exports = BadgeCriterion;
