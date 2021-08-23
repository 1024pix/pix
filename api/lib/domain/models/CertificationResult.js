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
    createdAt,
    isPublished,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    sessionId,
    isCourseCancelled,
  } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.createdAt = createdAt;
    this.isPublished = isPublished;
    this.cleaCertificationResult = cleaCertificationResult;
    this.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    this.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
    this.sessionId = sessionId;
    this.status = _getStatus(lastAssessmentResult, isCourseCancelled);

    if (lastAssessmentResult) {
      this.pixScore = lastAssessmentResult.pixScore;
      this.commentForOrganization = lastAssessmentResult.commentForOrganization;
      this.competencesWithMark = lastAssessmentResult.competenceMarks;
    } else {
      this.pixScore = undefined;
      this.commentForOrganization = undefined;
      this.competencesWithMark = [];
    }
  }

  static from({
    certificationResultDTO,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  }) {
    const certificationResult = new CertificationResult();
    certificationResult.id = certificationResultDTO.id;
    certificationResult.firstName = certificationResultDTO.firstName;
    certificationResult.lastName = certificationResultDTO.lastName;
    certificationResult.birthplace = certificationResultDTO.birthplace;
    certificationResult.birthdate = certificationResultDTO.birthdate;
    certificationResult.externalId = certificationResultDTO.externalId;
    certificationResult.createdAt = certificationResultDTO.createdAt;
    certificationResult.isPublished = certificationResultDTO.isPublished;
    certificationResult.cleaCertificationResult = cleaCertificationResult;
    certificationResult.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    certificationResult.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
    certificationResult.sessionId = certificationResultDTO.sessionId;
    if (certificationResultDTO.isCancelled) {
      certificationResult.status = status.CANCELLED;
    } else {
      certificationResult.status = certificationResultDTO?.assessmentResultStatus ?? status.STARTED;
    }
    certificationResult.pixScore = certificationResultDTO.pixScore;
    certificationResult.commentForOrganization = certificationResultDTO.commentForOrganization;
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
