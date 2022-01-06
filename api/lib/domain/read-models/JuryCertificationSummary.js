const { status: assessmentResultStatuses } = require('../models/AssessmentResult');
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR,
} = require('../models/Badge').keys;

const STARTED = 'started';
const CANCELLED = 'cancelled';
const ENDED_BY_SUPERVISOR = 'endedBySupervisor';

const partnerCertificationStatus = {
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
    partnerCertifications,
    certificationIssueReports,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = _getStatus(status, isCourseCancelled, isEndedBySupervisor);
    this.pixScore = pixScore;
    this.isFlaggedAborted = Boolean(abortReason) && !completedAt;
    this.partnerCertifications = partnerCertifications;
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
    const cleaPartnerCertification = this.partnerCertifications.find(({ partnerKey }) =>
      [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(partnerKey)
    );
    return this._getStatusFromPartnerCertification(cleaPartnerCertification);
  }

  getPixPlusDroitMaitreCertificationStatus() {
    const pixPlusDroitMaitrePartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_DROIT_MAITRE_CERTIF
    );
    return this._getStatusFromPartnerCertification(pixPlusDroitMaitrePartnerCertification);
  }

  getPixPlusDroitExpertCertificationStatus() {
    const pixPlusDroitExpertPartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_DROIT_EXPERT_CERTIF
    );
    return this._getStatusFromPartnerCertification(pixPlusDroitExpertPartnerCertification);
  }

  getPixPlusEduAutonomeCertificationStatus() {
    const pixPlusEduAutonomePartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME
    );
    return this._getStatusFromPartnerCertification(pixPlusEduAutonomePartnerCertification);
  }

  getPixPlusEduAvanceCertificationStatus() {
    const pixPlusEduAvancePartnerCertification = this.partnerCertifications.find(({ partnerKey }) =>
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE].includes(partnerKey)
    );
    return this._getStatusFromPartnerCertification(pixPlusEduAvancePartnerCertification);
  }

  getPixPlusEduExpertCertificationStatus() {
    const pixPlusEduExpertPartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
    );
    return this._getStatusFromPartnerCertification(pixPlusEduExpertPartnerCertification);
  }

  getPixPlusEduFormateurCertificationStatus() {
    const pixPlusEduFormateurPartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR
    );
    return this._getStatusFromPartnerCertification(pixPlusEduFormateurPartnerCertification);
  }

  _getStatusFromPartnerCertification(partnerCertification) {
    if (!partnerCertification) {
      return partnerCertificationStatus.NOT_TAKEN;
    }
    return partnerCertification.acquired ? partnerCertificationStatus.ACQUIRED : partnerCertificationStatus.REJECTED;
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
