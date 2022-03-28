const _ = require('lodash');
const CompetenceMark = require('./CompetenceMark');
const ComplementaryCertificationCourseResult = require('./ComplementaryCertificationCourseResult');
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
    complementaryCertificationCourseResults,
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
    this.complementaryCertificationCourseResults = complementaryCertificationCourseResults;
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
    const complementaryCertificationCourseResults = _.compact(
      certificationResultDTO.complementaryCertificationCourseResults
    ).map(
      (complementaryCertifCourseResult) => new ComplementaryCertificationCourseResult(complementaryCertifCourseResult)
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
      complementaryCertificationCourseResults,
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
    return this.complementaryCertificationCourseResults.some(({ partnerKey }) =>
      [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(partnerKey)
    );
  }

  hasAcquiredClea() {
    const cleaComplementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(
      ({ partnerKey }) => [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2].includes(partnerKey)
    );
    return Boolean(cleaComplementaryCertificationCourseResult?.acquired);
  }

  hasTakenPixPlusDroitMaitre() {
    return this.complementaryCertificationCourseResults.some(
      ({ partnerKey }) => partnerKey === PIX_DROIT_MAITRE_CERTIF
    );
  }

  hasAcquiredPixPlusDroitMaitre() {
    const pixPlusDroitMaitreComplementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(
      ({ partnerKey }) => partnerKey === PIX_DROIT_MAITRE_CERTIF
    );
    return Boolean(pixPlusDroitMaitreComplementaryCertificationCourseResult?.acquired);
  }

  hasTakenPixPlusDroitExpert() {
    return this.complementaryCertificationCourseResults.some(
      ({ partnerKey }) => partnerKey === PIX_DROIT_EXPERT_CERTIF
    );
  }

  hasAcquiredPixPlusDroitExpert() {
    const pixPlusDroitExpertComplementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(
      ({ partnerKey }) => partnerKey === PIX_DROIT_EXPERT_CERTIF
    );
    return Boolean(pixPlusDroitExpertComplementaryCertificationCourseResult?.acquired);
  }

  hasTakenPixPlusEduInitie() {
    return this.complementaryCertificationCourseResults.some(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE
    );
  }

  hasAcquiredPixPlusEduInitie() {
    const pixPlusEduInitieComplementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE
    );
    return Boolean(pixPlusEduInitieComplementaryCertificationCourseResult?.acquired);
  }

  hasTakenPixPlusEduConfirme() {
    return this.complementaryCertificationCourseResults.some(({ partnerKey }) =>
      [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(
        partnerKey
      )
    );
  }

  hasAcquiredPixPlusEduConfirme() {
    const pixPlusEduConfirmeComplementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(
      ({ partnerKey }) =>
        [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME].includes(
          partnerKey
        )
    );
    return Boolean(pixPlusEduConfirmeComplementaryCertificationCourseResult?.acquired);
  }

  hasTakenPixPlusEduAvance() {
    return this.complementaryCertificationCourseResults.some(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
    );
  }

  hasAcquiredPixPlusEduAvance() {
    const pixPlusEduAvanceComplementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE
    );
    return Boolean(pixPlusEduAvanceComplementaryCertificationCourseResult?.acquired);
  }

  hasTakenPixPlusEduExpert() {
    return this.complementaryCertificationCourseResults.some(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
    );
  }

  hasAcquiredPixPlusEduExpert() {
    const pixPlusEduExpertComplementaryCertificationCourseResult = this.complementaryCertificationCourseResults.find(
      ({ partnerKey }) => partnerKey === PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT
    );
    return Boolean(pixPlusEduExpertComplementaryCertificationCourseResult?.acquired);
  }
}

CertificationResult.status = status;
module.exports = CertificationResult;
