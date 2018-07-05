class ResultCompetence {
  constructor({
    id,
    // attributes
    index,
    level,
    name,
    score,
    // embedded
    // relations
  } = {}) {
    this.id = id;
    // attributes
    this.index = index;
    this.level = level;
    this.name = name;
    this.score = score;
    // embedded
    // relations
  }
}

module.exports = ResultCompetence;
