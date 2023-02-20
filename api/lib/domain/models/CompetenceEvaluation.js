const statuses = {
  STARTED: 'started',
  RESET: 'reset',
};

class CompetenceEvaluation {
  constructor({ id, createdAt, updatedAt, status, assessment, scorecard, assessmentId, competenceId, userId } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.status = status;
    //includes
    this.assessment = assessment;
    this.scorecard = scorecard;
    this.assessmentId = assessmentId;
    this.competenceId = competenceId;
    this.userId = userId;
  }
}

CompetenceEvaluation.statuses = statuses;

export default CompetenceEvaluation;
