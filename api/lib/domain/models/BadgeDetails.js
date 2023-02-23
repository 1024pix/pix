const { SCOPES } = require('./BadgeCriterion.js');

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
  constructor({ id, name, scope, threshold, skillSets, cappedTubes }) {
    this.id = id;
    this.name = name;
    this.scope = scope;
    this.threshold = threshold;
    this.skillSets = skillSets;
    this.cappedTubes = cappedTubes;
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      scope: this.scope,
      threshold: this.threshold,
      skillSets: this.skillSets.map((skillSet) => skillSet.toDTO()),
      cappedTubes: this.cappedTubes.map((cappedTube) => cappedTube.toDTO()),
    };
  }
}

class SkillSet {
  constructor({ name, skillIds }) {
    this.name = name;
    this.skillIds = skillIds;
  }

  toDTO() {
    return {
      name: this.name,
      skillIds: this.skillIds,
    };
  }
}

class CappedTube {
  constructor({ tubeId, level }) {
    this.tubeId = tubeId;
    this.level = level;
  }

  toDTO() {
    return {
      tubeId: this.tubeId,
      level: this.level,
    };
  }
}

BadgeCriterion.SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  SKILL_SET: 'SkillSet',
  CAPPED_TUBES: 'CappedTubes',
};

module.exports = { BadgeDetails, BadgeCriterion, SkillSet, CappedTube, SCOPES };
