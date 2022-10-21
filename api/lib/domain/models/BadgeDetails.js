const { SCOPES } = require('./BadgeCriterion');

class BadgeDetails {
  constructor({ id, key, altMessage, imageUrl, message, title, isCertifiable, isAlwaysVisible, criteria }) {
    this.id = id;
    this.altMessage = altMessage;
    this.imageUrl = imageUrl;
    this.message = message;
    this.title = title;
    this.key = key;
    this.isCertifiable = isCertifiable;
    this.isAlwaysVisible = isAlwaysVisible;
    this.criteria = criteria;
  }
}

class BadgeCriterion {
  constructor({ id, scope, threshold, skillSets, cappedTubes }) {
    this.id = id;
    this.scope = scope;
    this.threshold = threshold;
    this.skillSets = skillSets;
    this.cappedTubes = cappedTubes;
  }
}

class SkillSet {
  constructor({ name, skillIds }) {
    this.name = name;
    this.skillIds = skillIds;
  }
}

class CappedTube {
  constructor({ tubeId, level }) {
    this.tubeId = tubeId;
    this.level = level;
  }
}

BadgeCriterion.SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  SKILL_SET: 'SkillSet',
  CAPPED_TUBES: 'CappedTubes',
};

module.exports = { BadgeDetails, BadgeCriterion, SkillSet, CappedTube, SCOPES };
