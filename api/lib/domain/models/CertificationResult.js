const _ = require('lodash');
const CompetenceMark = require('./CompetenceMark');
const PartnerCertification = require('./PartnerCertification');
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
} = require('./Badge').keys;

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
    const partnerCertifications = _.compact(certificationResultDTO.partnerCertifications).map(
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
    return this.partnerCertifications.some(({ partnerKey }) =>
      [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(partnerKey)
    );
  }

  hasAcquiredClea() {
    const cleaPartnerCertification = this.partnerCertifications.find(({ partnerKey }) =>
      [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(partnerKey)
    );
    return Boolean(cleaPartnerCertification?.acquired);
  }

  hasTakenPixPlusDroitMaitre() {
    return this.partnerCertifications.some(({ partnerKey }) => partnerKey === PIX_DROIT_MAITRE_CERTIF);
  }

  hasAcquiredPixPlusDroitMaitre() {
    const pixPlusDroitMaitrePartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_DROIT_MAITRE_CERTIF
    );
    return Boolean(pixPlusDroitMaitrePartnerCertification?.acquired);
  }

  hasTakenPixPlusDroitExpert() {
    return this.partnerCertifications.some(({ partnerKey }) => partnerKey === PIX_DROIT_EXPERT_CERTIF);
  }

  hasAcquiredPixPlusDroitExpert() {
    const pixPlusDroitExpertPartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_DROIT_EXPERT_CERTIF
    );
    return Boolean(pixPlusDroitExpertPartnerCertification?.acquired);
  }

  hasTakenPixPlusEduInitie() {
    return this.partnerCertifications.some(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE
    );
  }

  hasAcquiredPixPlusEduInitie() {
    const pixPlusEduInitiePartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE
    );
    return Boolean(pixPlusEduInitiePartnerCertification?.acquired);
  }

  hasTakenPixPlusEduConfirme() {
    return this.partnerCertifications.some(({ partnerKey }) =>
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(
        partnerKey
      )
    );
  }

  hasAcquiredPixPlusEduConfirme() {
    const pixPlusEduConfirmePartnerCertification = this.partnerCertifications.find(({ partnerKey }) =>
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(
        partnerKey
      )
    );
    return Boolean(pixPlusEduConfirmePartnerCertification?.acquired);
  }

  hasTakenPixPlusEduAvance() {
    return this.partnerCertifications.some(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
    );
  }

  hasAcquiredPixPlusEduAvance() {
    const pixPlusEduAvancePartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
    );
    return Boolean(pixPlusEduAvancePartnerCertification?.acquired);
  }

  hasTakenPixPlusEduExpert() {
    return this.partnerCertifications.some(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
    );
  }

  hasAcquiredPixPlusEduExpert() {
    const pixPlusEduExpertPartnerCertification = this.partnerCertifications.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
    );
    return Boolean(pixPlusEduExpertPartnerCertification?.acquired);
  }
}

CertificationResult.status = status;
module.exports = CertificationResult;
