class AssessmentResult {
  // FIXME: assessmentId && juryId to replace by assessment && jury domain objects
  constructor({
    pixScore,
    level,
    status,
    emitter,
    commentForJury,
    commentForCandidate,
    commentForOrganization,
    id,
    createdAt,
    juryId,
    assessmentId,
    competenceMarks = [],
  }) {
    this.pixScore = pixScore;
    this.level = level;
    this.status = status;
    this.emitter = emitter;
    this.commentForJury = commentForJury;
    this.commentForCandidate = commentForCandidate;
    this.commentForOrganization = commentForOrganization;
    this.id = id;
    this.createdAt = createdAt;
    this.juryId = juryId;
    this.assessmentId = assessmentId;
    this.competenceMarks = competenceMarks;
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
