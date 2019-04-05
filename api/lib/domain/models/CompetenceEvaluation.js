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

    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.assessmentId = assessmentId;
    this.competenceId = competenceId;
    this.userId = userId;
  }
}

module.exports = CompetenceEvaluation;
