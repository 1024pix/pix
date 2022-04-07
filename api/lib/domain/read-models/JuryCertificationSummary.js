const { status: assessmentResultStatuses } = require('../models/AssessmentResult');
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../models/Badge').keys;

const STARTED = 'started';
const CANCELLED = 'cancelled';
const ENDED_BY_SUPERVISOR = 'endedBySupervisor';

const complementaryCertificationStatus = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};

class JuryCertificationSummary {
  constructor({
    id,
    firstName,
    lastName,
    status,
    pixScore,
    createdAt,
    completedAt,
    abortReason,
    isPublished,
    isCourseCancelled,
    isEndedBySupervisor,
    hasSeenEndTestScreen,
    complementaryCertificationCourseResults,
    certificationIssueReports,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = _getStatus(status, isCourseCancelled, isEndedBySupervisor);
    this.pixScore = pixScore;
    this.isFlaggedAborted = Boolean(abortReason) && !completedAt;
    this.complementaryCertificationCourseResults = complementaryCertificationCourseResults;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.certificationIssueReports = certificationIssueReports;
  }

  isActionRequired() {
    return this.certificationIssueReports.some((issueReport) => issueReport.isImpactful && !issueReport.isResolved());
  }

  hasScoringError() {
    return this.status === JuryCertificationSummary.statuses.ERROR;
  }

  hasCompletedAssessment() {
    return this.status !== JuryCertificationSummary.statuses.STARTED;
  }

  getCleaCertificationStatus() {
    return this._getStatusFromComplementaryCertification([PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2]);
  }

  getPixPlusDroitMaitreCertificationStatus() {
    return this._getStatusFromComplementaryCertification([PIX_DROIT_MAITRE_CERTIF]);
  }

  getPixPlusDroitExpertCertificationStatus() {
    return this._getStatusFromComplementaryCertification([PIX_DROIT_EXPERT_CERTIF]);
  }

  getPixPlusEduInitieCertificationStatus() {
    return this._getStatusFromComplementaryCertification([PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE]);
  }

  getPixPlusEduConfirmeCertificationStatus() {
    return this._getStatusFromComplementaryCertification([
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
    ]);
  }

  getPixPlusEduAvanceCertificationStatus() {
    return this._getStatusFromComplementaryCertification([PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE]);
  }

  getPixPlusEduExpertCertificationStatus() {
    return this._getStatusFromComplementaryCertification([PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT]);
  }

  _getStatusFromComplementaryCertification(complementaryCertificationKeys) {
    const complementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(({ partnerKey }) =>
      complementaryCertificationKeys.includes(partnerKey)
    );
    if (!complementaryCertificationCourseResult) {
      return complementaryCertificationStatus.NOT_TAKEN;
    }
    return complementaryCertificationCourseResult.acquired
      ? complementaryCertificationStatus.ACQUIRED
      : complementaryCertificationStatus.REJECTED;
  }
}

function _getStatus(status, isCourseCancelled, isEndedBySupervisor) {
  if (isCourseCancelled) {
    return CANCELLED;
  }

  if (isEndedBySupervisor) {
    return ENDED_BY_SUPERVISOR;
  }

  if (!Object.values(assessmentResultStatuses).includes(status)) {
    return STARTED;
  }

  return status;
}

module.exports = JuryCertificationSummary;
module.exports.statuses = { ...assessmentResultStatuses, STARTED, ENDED_BY_SUPERVISOR };
