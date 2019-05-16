const constants = require('../constants');

class Scorecard {
  constructor({
    id,
    name,
    description,
    competenceId,
    index,
    area,
    earnedPix,
    status,
  } = {}) {
    const roundedEarnedPix = Math.floor(earnedPix);

    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.competenceId = competenceId;
    this.index = index;
    this.area = area;
    this.earnedPix = roundedEarnedPix;
    this.level = this._getCompetenceLevel(roundedEarnedPix);
    this.pixScoreAheadOfNextLevel = this._getpixScoreAheadOfNextLevel(roundedEarnedPix);
    this.status = status;
  }

  _getCompetenceLevel(earnedPix) {
    const userLevel = Math.floor(earnedPix / constants.PIX_COUNT_BY_LEVEL);

    return Math.min(constants.MAX_REACHABLE_LEVEL, userLevel);
  }

  _getpixScoreAheadOfNextLevel(earnedPix) {
    return earnedPix % constants.PIX_COUNT_BY_LEVEL;
  }
}

module.exports = Scorecard;
