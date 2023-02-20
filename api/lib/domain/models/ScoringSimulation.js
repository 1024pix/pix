class ScoringSimulation {
  constructor({ id, user, answers = [] } = {}) {
    this.id = id;
    this.answers = answers;
    this.user = new ScoringSimulationUser(user);
  }
}

class ScoringSimulationUser {
  constructor({ id, estimatedLevel } = {}) {
    this.id = id;
    this.estimatedLevel = estimatedLevel;
  }
}

export default ScoringSimulation;
