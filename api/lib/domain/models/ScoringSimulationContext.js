class ScoringSimulationContext {
  constructor({ id, successProbabilityThreshold, calculateEstimatedLevel = false } = {}) {
    this.id = id;
    this.successProbabilityThreshold = successProbabilityThreshold;
    this.calculateEstimatedLevel = calculateEstimatedLevel;
  }
}

module.exports = ScoringSimulationContext;
