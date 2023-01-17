class SimulationResult {
  constructor({ id, estimatedLevel, pixScore, error } = {}) {
    this.id = id;
    this.estimatedLevel = estimatedLevel;
    this.pixScore = pixScore;
    this.error = error;
  }
}

module.exports = SimulationResult;
