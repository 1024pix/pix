const _ = require('lodash');
const CompetenceMark = require('./CompetenceMark');
const ComplementaryCertificationCourseResult = require('./ComplementaryCertificationCourseResult');
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('./Badge').keys;

const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  STARTED: 'started',
};

const emitters = {
  PIX_ALGO: 'PIX-ALGO',
  PIX_ALGO_AUTO_JURY: 'PIX-ALGO-AUTO-JURY',
  PIX_ALGO_NEUTRALIZATION: 'PIX-ALGO-NEUTRALIZATION',
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
    emitter,
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
    this.emitter = emitter;
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
      emitter: certificationResultDTO.emitter,
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

  hasBeenRejectedAutomatically() {
    return (
      this.status === status.REJECTED &&
      (this.emitter === emitters.PIX_ALGO || this.emitter === emitters.PIX_ALGO_AUTO_JURY)
    );
  }

  hasTakenClea() {
    const result = this._getCertificationCourseResultByPartnerKeys([
      PIX_EMPLOI_CLEA_V1,
      PIX_EMPLOI_CLEA_V2,
      PIX_EMPLOI_CLEA_V3,
    ]);
    return Boolean(result);
  }

  hasAcquiredClea() {
    const result = this._getCertificationCourseResultByPartnerKeys([
      PIX_EMPLOI_CLEA_V1,
      PIX_EMPLOI_CLEA_V2,
      PIX_EMPLOI_CLEA_V3,
    ]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusDroitMaitre() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_DROIT_MAITRE_CERTIF]);
    return Boolean(result);
  }

  hasAcquiredPixPlusDroitMaitre() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_DROIT_MAITRE_CERTIF]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusDroitExpert() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_DROIT_EXPERT_CERTIF]);
    return Boolean(result);
  }

  hasAcquiredPixPlusDroitExpert() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_DROIT_EXPERT_CERTIF]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu2ndDegreInitie() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu2ndDegreInitie() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu2ndDegreConfirme() {
    const result = this._getCertificationCourseResultByPartnerKeys([
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
    ]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu2ndDegreConfirme() {
    const result = this._getCertificationCourseResultByPartnerKeys([
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
    ]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu2ndDegreAvance() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu2ndDegreAvance() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu2ndDegreExpert() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu2ndDegreExpert() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu1erDegreInitie() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu1erDegreInitie() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu1erDegreConfirme() {
    const result = this._getCertificationCourseResultByPartnerKeys([
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
    ]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu1erDegreConfirme() {
    const result = this._getCertificationCourseResultByPartnerKeys([
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
    ]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu1erDegreAvance() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu1erDegreAvance() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE]);
    return Boolean(result?.acquired);
  }

  hasTakenPixPlusEdu1erDegreExpert() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT]);
    return Boolean(result);
  }

  hasAcquiredPixPlusEdu1erDegreExpert() {
    const result = this._getCertificationCourseResultByPartnerKeys([PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT]);
    return Boolean(result?.acquired);
  }

  getUniqComplementaryCertificationCourseResultHeaders() {
    return [
      ...new Set(
        _(this.complementaryCertificationCourseResults)
          .orderBy('id')
          .map(({ label }) => `Certification ${label}`)
          .value()
      ),
    ];
  }

  _getCertificationCourseResultByPartnerKeys(partnerKeys) {
    return this.complementaryCertificationCourseResults.find(({ partnerKey }) => partnerKeys.includes(partnerKey));
  }
}

CertificationResult.status = status;
CertificationResult.emitters = emitters;
module.exports = CertificationResult;
