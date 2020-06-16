const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated'
};

class AssessmentResult {
  // FIXME: assessmentId && juryId to replace by assessment && jury domain objects
  constructor({
    id,
    // attributes
    commentForCandidate,
    commentForJury,
    commentForOrganization,
    createdAt,
    emitter,
    pixScore,
    status,
    // includes
    competenceMarks = [],
    // references
    assessmentId,
    juryId,
  } = {}) {
    this.id = id;
    // attributes
    this.commentForCandidate = commentForCandidate;
    this.commentForJury = commentForJury;
    this.commentForOrganization = commentForOrganization;
    this.createdAt = createdAt;
    this.emitter = emitter;
    this.pixScore = pixScore;
    this.status = status;
    // includes
    this.competenceMarks = competenceMarks;
    // references
    this.assessmentId = assessmentId;
    this.juryId = juryId;
  }

  static BuildAlgoErrorResult(error, assessmentId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: error.message,
      pixScore: 0,
      status: 'error',
      assessmentId,
    });
  }

  static BuildStandardAssessmentResult(pixScore, status, assessmentId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: 'Computed',
      pixScore: pixScore,
      status,
      assessmentId,
    });
  }
}

AssessmentResult.status = status;

module.exports = AssessmentResult;
