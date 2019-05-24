const statuses = {
  STARTED: 'started',
  RESET: 'reset',
};

class CompetenceEvaluation {

  constructor({
    id,
    // attributes
    createdAt,
    updatedAt,
    status,
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
    this.status = status;
    //includes
    this.assessment = assessment;
    this.scorecard = scorecard;
    // references
    this.assessmentId = assessmentId;
    this.competenceId = competenceId;
    this.userId = userId;
  }
}

CompetenceEvaluation.statuses = statuses;

module.exports = CompetenceEvaluation;
