class ScoringSimulationContext {
  constructor({ id, successProbabilityThreshold, calculateEstimatedLevel } = {}) {
    this.id = id;
    this.successProbabilityThreshold = successProbabilityThreshold;
    this.calculateEstimatedLevel = calculateEstimatedLevel;
  }
}

module.exports = ScoringSimulationContext;
