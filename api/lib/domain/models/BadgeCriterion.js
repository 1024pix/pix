class BadgeCriterion {
  constructor({ id, scope, threshold, skillSetIds } = {}) {
    this.id = id;
    this.scope = scope;
    this.threshold = threshold;
    this.skillSetIds = skillSetIds;
  }
}

BadgeCriterion.SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  SKILL_SET: 'SkillSet',
};

module.exports = BadgeCriterion;
