const _ = require('lodash');
const CompetenceMark = require('./CompetenceMark');
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

const status = {
  CANCELLED: 'cancelled',
};

const complementaryCertificationStatus = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};

class JuryCertification {
  constructor({
    certificationCourseId,
    sessionId,
    userId,
    assessmentId,
    firstName,
    lastName,
    birthdate,
    sex,
    birthplace,
    birthINSEECode,
    birthCountry,
    birthPostalCode,
    createdAt,
    completedAt,
    status,
    isPublished,
    juryId,
    pixScore,
    competenceMarks,
    commentForCandidate,
    commentForOrganization,
    commentForJury,
    certificationIssueReports,
    complementaryCertificationCourseResults,
  }) {
    this.certificationCourseId = certificationCourseId;
    this.sessionId = sessionId;
    this.userId = userId;
    this.assessmentId = assessmentId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.sex = sex;
    this.birthplace = birthplace;
    this.birthINSEECode = birthINSEECode;
    this.birthCountry = birthCountry;
    this.birthPostalCode = birthPostalCode;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.status = status;
    this.isPublished = isPublished;
    this.juryId = juryId;
    this.pixScore = pixScore;
    this.competenceMarks = competenceMarks;
    this.commentForCandidate = commentForCandidate;
    this.commentForOrganization = commentForOrganization;
    this.commentForJury = commentForJury;
    this.certificationIssueReports = certificationIssueReports;
    this.complementaryCertificationCourseResults = complementaryCertificationCourseResults;
  }

  static from({ juryCertificationDTO, certificationIssueReports, complementaryCertificationCourseResults }) {
    const competenceMarkDTOs = _.compact(juryCertificationDTO.competenceMarks).map(
      (competenceMarkDTO) =>
        new CompetenceMark({
          ...competenceMarkDTO,
        })
    );

    return new JuryCertification({
      certificationCourseId: juryCertificationDTO.certificationCourseId,
      sessionId: juryCertificationDTO.sessionId,
      userId: juryCertificationDTO.userId,
      assessmentId: juryCertificationDTO.assessmentId,
      firstName: juryCertificationDTO.firstName,
      lastName: juryCertificationDTO.lastName,
      birthdate: juryCertificationDTO.birthdate,
      sex: juryCertificationDTO.sex,
      birthplace: juryCertificationDTO.birthplace,
      birthINSEECode: juryCertificationDTO.birthINSEECode,
      birthCountry: juryCertificationDTO.birthCountry,
      birthPostalCode: juryCertificationDTO.birthPostalCode,
      createdAt: juryCertificationDTO.createdAt,
      completedAt: juryCertificationDTO.completedAt,
      status: _getStatus(juryCertificationDTO.assessmentResultStatus, juryCertificationDTO.isCancelled),
      isPublished: juryCertificationDTO.isPublished,
      juryId: juryCertificationDTO.juryId,
      pixScore: juryCertificationDTO.pixScore,
      competenceMarks: competenceMarkDTOs,
      commentForCandidate: juryCertificationDTO.commentForCandidate,
      commentForOrganization: juryCertificationDTO.commentForOrganization,
      commentForJury: juryCertificationDTO.commentForJury,
      certificationIssueReports,
      complementaryCertificationCourseResults,
    });
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

function _getStatus(assessmentResultStatus, isCourseCancelled) {
  if (isCourseCancelled) return status.CANCELLED;
  return assessmentResultStatus;
}

module.exports = JuryCertification;
