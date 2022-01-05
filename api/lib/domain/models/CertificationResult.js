const _ = require('lodash');
const CompetenceMark = require('./CompetenceMark');
const PartnerCertification = require('./PartnerCertification');
const { PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2, PIX_DROIT_MAITRE_CERTIF, PIX_DROIT_EXPERT_CERTIF } =
  require('./Badge').keys;

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
    sessionId,
    status,
    pixScore,
    commentForOrganization,
    competencesWithMark,
    partnerCertifications,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthplace = birthplace;
    this.birthdate = birthdate;
    this.externalId = externalId;
    this.createdAt = createdAt;
    this.sessionId = sessionId;
    this.status = status;
    this.pixScore = pixScore;
    this.commentForOrganization = commentForOrganization;
    this.competencesWithMark = competencesWithMark;
    this.partnerCertifications = partnerCertifications;
  }

  static from({ certificationResultDTO }) {
    let certificationStatus;
    if (certificationResultDTO.isCancelled) {
      certificationStatus = status.CANCELLED;
    } else {
      certificationStatus = certificationResultDTO?.assessmentResultStatus ?? status.STARTED;
    }
    const competenceMarkDTOs = _.compact(certificationResultDTO.competenceMarks);
    const competencesWithMark = _.map(
      competenceMarkDTOs,
      (competenceMarkDTO) =>
        new CompetenceMark({
          ...competenceMarkDTO,
          area_code: competenceMarkDTO.area_code.toString(),
          competence_code: competenceMarkDTO.competence_code.toString(),
        })
    );
    const partnerCertifications = certificationResultDTO.partnerCertifications.map(
      (partnerCertification) => new PartnerCertification(partnerCertification)
    );

    return new CertificationResult({
      id: certificationResultDTO.id,
      firstName: certificationResultDTO.firstName,
      lastName: certificationResultDTO.lastName,
      birthplace: certificationResultDTO.birthplace,
      birthdate: certificationResultDTO.birthdate,
      externalId: certificationResultDTO.externalId,
      createdAt: certificationResultDTO.createdAt,
      sessionId: certificationResultDTO.sessionId,
      status: certificationStatus,
      pixScore: certificationResultDTO.pixScore,
      commentForOrganization: certificationResultDTO.commentForOrganization,
      competencesWithMark,
      partnerCertifications,
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
    return this.partnerCertifications.some((partnerCertification) =>
      [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(partnerCertification.partnerKey)
    );
  }

  hasAcquiredClea() {
    const cleaPartnerCertification = this.partnerCertifications.find((partnerCertification) =>
      [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(partnerCertification.partnerKey)
    );
    return cleaPartnerCertification && cleaPartnerCertification.acquired;
  }

  hasTakenPixPlusDroitMaitre() {
    return this.partnerCertifications.some(
      (partnerCertification) => partnerCertification.partnerKey === PIX_DROIT_MAITRE_CERTIF
    );
  }

  hasAcquiredPixPlusDroitMaitre() {
    const pixPlusDroitMaitrePartnerCertification = this.partnerCertifications.find(
      (partnerCertification) => partnerCertification.partnerKey === PIX_DROIT_MAITRE_CERTIF
    );
    return pixPlusDroitMaitrePartnerCertification && pixPlusDroitMaitrePartnerCertification.acquired;
  }

  hasTakenPixPlusDroitExpert() {
    return this.partnerCertifications.some(
      (partnerCertification) => partnerCertification.partnerKey === PIX_DROIT_EXPERT_CERTIF
    );
  }

  hasAcquiredPixPlusDroitExpert() {
    const pixPlusDroitExpertPartnerCertification = this.partnerCertifications.find(
      (partnerCertification) => partnerCertification.partnerKey === PIX_DROIT_EXPERT_CERTIF
    );
    return pixPlusDroitExpertPartnerCertification && pixPlusDroitExpertPartnerCertification.acquired;
  }
}

CertificationResult.status = status;
module.exports = CertificationResult;
