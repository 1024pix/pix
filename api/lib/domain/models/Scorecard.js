const MAX_REACHABLE_LEVEL = 5;
const NB_PIX_BY_LEVEL = 8;

class Scorecard {
  constructor({
    id,
    name,
    description,
    index,
    area,
    earnedPix,
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.index = index;
    this.area = area;
    this.earnedPix = earnedPix;
    this.level = this._getCompetenceLevel(earnedPix);
    this.pixScoreAheadOfNextLevel= this._getpixScoreAheadOfNextLevel(earnedPix);
  }

  _getCompetenceLevel(earnedPix) {
    const userLevel = Math.floor(earnedPix / NB_PIX_BY_LEVEL);

    return Math.min(MAX_REACHABLE_LEVEL, userLevel);
  }

  _getpixScoreAheadOfNextLevel(earnedPix) {
    return earnedPix % NB_PIX_BY_LEVEL;
  }
}

Scorecard.MAX_REACHABLE_LEVEL = MAX_REACHABLE_LEVEL;

module.exports = Scorecard;
