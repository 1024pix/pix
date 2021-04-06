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

  static buildStartedAssessmentResult({ assessmentId }) {
    return new AssessmentResult({
      id: null,
      assessmentId,
      status: Assessment.states.STARTED,
      commentForCandidate: null,
      commentForOrganization: null,
      commentForJury: null,
      createdAt: null,
      emitter: null,
      juryId: null,
      pixScore: null,
      competenceMarks: [],
    });
  }
}

AssessmentResult.status = status;

module.exports = AssessmentResult;
