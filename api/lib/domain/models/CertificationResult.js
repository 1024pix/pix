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
    firstName,
    lastName,
    birthplace,
    birthdate,
    externalId,
    createdAt,
    isPublished,
    sessionId,
    status,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.createdAt = createdAt;
    this.isPublished = isPublished;
    this.sessionId = sessionId;
    this.status = status;
    this.pixScore = pixScore;
    this.commentForOrganization = commentForOrganization;
    this.competencesWithMark = competencesWithMark;
    this.cleaCertificationResult = cleaCertificationResult;
    this.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    this.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
  }

  static from({
    certificationResultDTO,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  }) {
    let certificationStatus;
    if (certificationResultDTO.isCancelled) {
      certificationStatus = status.CANCELLED;
    } else {
      certificationStatus = certificationResultDTO?.assessmentResultStatus ?? status.STARTED;
    }
    const competenceMarkDTOs = JSON.parse(certificationResultDTO.competenceMarksJson);
    const competencesWithMark = _.map(competenceMarkDTOs, (competenceMarkDTO) => new CompetenceMark({
      ...competenceMarkDTO,
      area_code: competenceMarkDTO.area_code.toString(),
      competence_code: competenceMarkDTO.competence_code.toString(),
    }));

    return new CertificationResult({
      id: certificationResultDTO.id,
      firstName: certificationResultDTO.firstName,
      lastName: certificationResultDTO.lastName,
      birthplace: certificationResultDTO.birthplace,
      birthdate: certificationResultDTO.birthdate,
      externalId: certificationResultDTO.externalId,
      createdAt: certificationResultDTO.createdAt,
      isPublished: certificationResultDTO.isPublished,
      sessionId: certificationResultDTO.sessionId,
      status: certificationStatus,
      pixScore: certificationResultDTO.pixScore,
      commentForOrganization: certificationResultDTO.commentForOrganization,
      competencesWithMark,
      cleaCertificationResult,
      pixPlusDroitMaitreCertificationResult,
      pixPlusDroitExpertCertificationResult,
    });
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

CertificationResult.status = status;
module.exports = CertificationResult;
