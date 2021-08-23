const _ = require('lodash');
const CompetenceMark = require('./CompetenceMark');

const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  STARTED: 'started',
};

class CertificationResult {
  constructor({
    id,
    lastAssessmentResult,
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    completedAt,
    createdAt,
    isPublished,
    isV2Certification,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports,
    hasSeenEndTestScreen,
    assessmentId,
    sessionId,
    isCourseCancelled,
  } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
    this.isPublished = isPublished;
    this.isV2Certification = isV2Certification;
    this.cleaCertificationResult = cleaCertificationResult;
    this.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    this.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
    this.certificationIssueReports = certificationIssueReports;
    this.hasSeenEndTestScreen = hasSeenEndTestScreen;
    this.assessmentId = assessmentId;
    this.sessionId = sessionId;
    this.status = _getStatus(lastAssessmentResult, isCourseCancelled);

    if (lastAssessmentResult) {
      this.resultCreatedAt = lastAssessmentResult.createdAt;
      this.pixScore = lastAssessmentResult.pixScore;
      this.emitter = lastAssessmentResult.emitter;
      this.commentForCandidate = lastAssessmentResult.commentForCandidate;
      this.commentForJury = lastAssessmentResult.commentForJury;
      this.commentForOrganization = lastAssessmentResult.commentForOrganization;
      this.competencesWithMark = lastAssessmentResult.competenceMarks;
      this.juryId = lastAssessmentResult.juryId;
    } else {
      this.resultCreatedAt = undefined;
      this.pixScore = undefined;
      this.emitter = undefined;
      this.commentForCandidate = undefined;
      this.commentForJury = undefined;
      this.commentForOrganization = undefined;
      this.competencesWithMark = [];
      this.juryId = undefined;
    }
  }

  static from({
    certificationResultDTO,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports,
  }) {
    const certificationResult = new CertificationResult();
    certificationResult.id = certificationResultDTO.id;
    certificationResult.firstName = certificationResultDTO.firstName;
    certificationResult.lastName = certificationResultDTO.lastName;
    certificationResult.birthplace = certificationResultDTO.birthplace;
    certificationResult.birthdate = certificationResultDTO.birthdate;
    certificationResult.externalId = certificationResultDTO.externalId;
    certificationResult.createdAt = certificationResultDTO.createdAt;
    certificationResult.completedAt = certificationResultDTO.completedAt;
    certificationResult.isPublished = certificationResultDTO.isPublished;
    certificationResult.isV2Certification = certificationResultDTO.isV2Certification;
    certificationResult.cleaCertificationResult = cleaCertificationResult;
    certificationResult.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    certificationResult.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
    certificationResult.certificationIssueReports = certificationIssueReports;
    certificationResult.hasSeenEndTestScreen = certificationResultDTO.hasSeenEndTestScreen;
    certificationResult.assessmentId = certificationResultDTO.assessmentId;
    certificationResult.sessionId = certificationResultDTO.sessionId;
    if (certificationResultDTO.isCancelled) {
      certificationResult.status = status.CANCELLED;
    } else {
      certificationResult.status = certificationResultDTO?.assessmentResultStatus ?? status.STARTED;
    }
    certificationResult.resultCreatedAt = certificationResultDTO.resultCreatedAt;
    certificationResult.pixScore = certificationResultDTO.pixScore;
    certificationResult.emitter = certificationResultDTO.emitter;
    certificationResult.commentForCandidate = certificationResultDTO.commentForCandidate;
    certificationResult.commentForJury = certificationResultDTO.commentForJury;
    certificationResult.commentForOrganization = certificationResultDTO.commentForOrganization;
    certificationResult.juryId = certificationResultDTO.juryId;
    const competenceMarkDTOs = JSON.parse(certificationResultDTO.competenceMarksJson);
    certificationResult.competencesWithMark = _.map(competenceMarkDTOs, (competenceMarkDTO) => new CompetenceMark({
      ...competenceMarkDTO,
      area_code: competenceMarkDTO.area_code.toString(),
      competence_code: competenceMarkDTO.competence_code.toString(),
    }));
    return certificationResult;
  }

  isCancelled() {
    return this.status === status.CANCELLED;
  }

  isValidated() {
    return this.status === status.VALIDATED;
  }

  isRejected() {
    return this.status === status.REJECTED;
  }

  isInError() {
    return this.status === status.ERROR;
  }

  isStarted() {
    return this.status === status.STARTED;
  }

  hasTakenClea() {
    return this.cleaCertificationResult.isTaken();
  }

  hasAcquiredClea() {
    return this.cleaCertificationResult.isAcquired();
  }

  hasTakenPixPlusDroitMaitre() {
    return this.pixPlusDroitMaitreCertificationResult.isTaken();
  }

  hasAcquiredPixPlusDroitMaitre() {
    return this.pixPlusDroitMaitreCertificationResult.isAcquired();
  }

  hasTakenPixPlusDroitExpert() {
    return this.pixPlusDroitExpertCertificationResult.isTaken();
  }

  hasAcquiredPixPlusDroitExpert() {
    return this.pixPlusDroitExpertCertificationResult.isAcquired();
  }
}

function _getStatus(lastAssessmentResult, isCourseCancelled) {
  if (isCourseCancelled) {
    return status.CANCELLED;
  }

  return lastAssessmentResult?.status ?? status.STARTED;
}

CertificationResult.status = status;
module.exports = CertificationResult;
