class ScoringSimulationResult {
  constructor({ id, estimatedLevel, pixScore, pixScoreByCompetence = [], error } = {}) {
    this.id = id;
    this.estimatedLevel = estimatedLevel;
    this.pixScore = pixScore;
    this.pixScoreByCompetence = pixScoreByCompetence.map(
      (competenceScore) => new SimulationCompetenceResult(competenceScore)
    );
    this.error = error;
  }
}

class SimulationCompetenceResult {
  constructor({ competenceId, pixScore }) {
    this.competenceId = competenceId;
    this.pixScore = pixScore;
  }
}

export default ScoringSimulationResult;
