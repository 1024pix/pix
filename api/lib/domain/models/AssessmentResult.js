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
}

module.exports = AssessmentResult;
