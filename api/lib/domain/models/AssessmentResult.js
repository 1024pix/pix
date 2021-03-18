const Assessment = require('./Assessment');

const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
};

class AssessmentResult {
  // FIXME: assessmentId && juryId to replace by assessment && jury domain objects
  constructor({
    id,
    commentForCandidate,
    commentForJury,
    commentForOrganization,
    createdAt,
    emitter,
    pixScore,
    status,
    competenceMarks = [],
    assessmentId,
    juryId,
  } = {}) {
    this.id = id;
    this.commentForCandidate = commentForCandidate;
    this.commentForJury = commentForJury;
    this.commentForOrganization = commentForOrganization;
    this.createdAt = createdAt;
    this.emitter = emitter;
    this.pixScore = pixScore;
    this.status = status;
    this.competenceMarks = competenceMarks;
    this.assessmentId = assessmentId;
    this.juryId = juryId;
  }

  static buildAlgoErrorResult(error, assessmentId, juryId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: error.message,
      pixScore: 0,
      status: 'error',
      assessmentId,
      juryId,
    });
  }

  static buildStandardAssessmentResult(pixScore, status, assessmentId, juryId) {
    return new AssessmentResult({
      emitter: 'PIX-ALGO',
      commentForJury: 'Computed',
      pixScore: pixScore,
      status,
      assessmentId,
      juryId,
    });
  }

  static buildStartedAssessmentResult({ assessmentId }) {
    return new AssessmentResult({
      assessmentId,
      status: Assessment.states.STARTED,
    });
  }
}

AssessmentResult.status = status;

module.exports = AssessmentResult;
