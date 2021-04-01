const Assessment = require('../models/Assessment');

class AssessmentResult {
  constructor({
    assessmentId,
    status,
    commentForCandidate,
    commentForOrganization,
    commentForJury,
    juryId,
    pixScore,
    competencesWithMark,
  }) {
    this.assessmentId = assessmentId;
    this.status = status;
    this.commentForCandidate = commentForCandidate;
    this.commentForOrganization = commentForOrganization;
    this.commentForJury = commentForJury;
    this.juryId = juryId;
    this.pixScore = pixScore;
    this.competencesWithMark = competencesWithMark;
  }

  static buildStartedAssessmentResult({ assessmentId }) {
    return new AssessmentResult({
      assessmentId,
      status: Assessment.states.STARTED,
      commentForCandidate: null,
      commentForOrganization: null,
      commentForJury: null,
      juryId: null,
      pixScore: null,
      competencesWithMark: [],
    });
  }
}

module.exports = AssessmentResult;
