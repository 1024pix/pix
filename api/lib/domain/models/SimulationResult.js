class SimulationResult {
  constructor({ id, pixScore, error } = {}) {
    this.id = id;
    this.pixScore = pixScore;
    this.error = error;
  }
}

module.exports = SimulationResult;
