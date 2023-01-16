class ScoringSimulation {
  constructor({ id, estimatedLevel, answers = [] } = {}) {
    this.id = id;
    this.estimatedLevel = estimatedLevel;
    this.answers = answers;
  }
}

module.exports = ScoringSimulation;
