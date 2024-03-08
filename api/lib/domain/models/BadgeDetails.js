const SCOPES = {
  CAMPAIGN_PARTICIPATION: 'CampaignParticipation',
  CAPPED_TUBES: 'CappedTubes',
};

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
  constructor({ id, name, scope, threshold, cappedTubes }) {
    this.id = id;
    this.name = name;
    this.scope = scope;
    this.threshold = threshold;
    this.cappedTubes = cappedTubes;
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      scope: this.scope,
      threshold: this.threshold,
      cappedTubes: this.cappedTubes.map((cappedTube) => cappedTube.toDTO()),
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

export { BadgeCriterion, BadgeDetails, CappedTube, SCOPES };
