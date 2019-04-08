class CompetenceEvaluation {

  constructor({
    id,
    // attributes
    createdAt,
    updatedAt,
    // includes
    // references
    assessmentId,
    competenceId,
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    // references
    this.assessmentId = assessmentId;
    this.competenceId = competenceId;
    this.userId = userId;
  }
}

module.exports = CompetenceEvaluation;
