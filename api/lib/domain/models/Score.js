const MAX_REACHABLE_LEVEL = 5;
const NB_PIX_BY_LEVEL = 8;

class Score {

  constructor({
    // attributes
    pixScore,
    // includes
    // references
  } = {}) {
    // attributes
    this.pixScore = pixScore;
    // includes
    // references
  }

  get displayedPixScore() {
    return Math.floor(this.pixScore);
  }

  get obtainedLevel() {
    const estimatedLevel = Math.floor(this.pixScore / NB_PIX_BY_LEVEL);
    return (estimatedLevel >= MAX_REACHABLE_LEVEL) ? MAX_REACHABLE_LEVEL : estimatedLevel;
  }
}

module.exports = Score;
