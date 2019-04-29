class CompetenceEvaluation {

  constructor({
    id,
    // attributes
    createdAt,
    updatedAt,
    // includes
    assessment,
    scorecard,
    // references
    assessmentId,
    competenceId,
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    //includes
    this.assessment = assessment;
    this.scorecard = scorecard;
    // references
    this.assessmentId = assessmentId;
    this.competenceId = competenceId;
    this.userId = userId;
  }
}

module.exports = CompetenceEvaluation;
