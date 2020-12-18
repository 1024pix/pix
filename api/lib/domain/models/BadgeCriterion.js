class BadgeCriterion {

  constructor({
    id,
    scope,
    threshold,
  } = {}) {
    this.id = id;
    this.scope = scope;
    this.threshold = threshold;
  }
}

BadgeCriterion.SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  EVERY_PARTNER_COMPETENCE: 'EveryPartnerCompetence',
};

module.exports = BadgeCriterion;
