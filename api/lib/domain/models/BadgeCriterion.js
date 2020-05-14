class BadgeCriterion {

  constructor({
    id,
    // attributes
    scope,
    threshold,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.scope = scope;
    this.threshold = threshold;
    // includes
    // references
  }
}

BadgeCriterion.SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  EVERY_PARTNER_COMPETENCE: 'EveryPartnerCompetence'
};

module.exports = BadgeCriterion;
