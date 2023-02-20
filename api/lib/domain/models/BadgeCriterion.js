class BadgeCriterion {
  constructor({ id, scope, threshold, skillSetIds, badgeId } = {}) {
    this.id = id;
    this.scope = scope;
    this.threshold = threshold;
    this.skillSetIds = skillSetIds;
    this.badgeId = badgeId;
  }
}

BadgeCriterion.SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  SKILL_SET: 'SkillSet',
  CAPPED_TUBES: 'CappedTubes',
};

export default BadgeCriterion;
