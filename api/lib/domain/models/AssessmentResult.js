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
    level,
    pixScore,
    status,
    // embedded
    competenceMarks = [],
    // relations
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
    this.level = level;
    this.pixScore = pixScore;
    this.status = status;
    // embedded
    this.competenceMarks = competenceMarks;
    // relations
    this.assessmentId = assessmentId;
    this.juryId = juryId;
  }

  static BuildAlgoErrorResult(error, assessmentId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: error.message,
      level: 0,
      pixScore: 0,
      status: 'error',
      assessmentId,
    });
  }

  static BuildStandardAssessmentResult(level, pixScore, status, assessmentId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: 'Computed',
      level: level,
      pixScore: pixScore,
      status,
      assessmentId,
    });
  }
}

module.exports = AssessmentResult;
