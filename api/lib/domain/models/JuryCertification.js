const _ = require('lodash');
const CompetenceMark = require('./CompetenceMark');

const status = {
  CANCELLED: 'cancelled',
};

class JuryCertification {
  constructor({
    certificationCourseId,
    sessionId,
    userId,
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
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    certificationIssueReports,
  }) {
    this.certificationCourseId = certificationCourseId;
    this.sessionId = sessionId;
    this.userId = userId;
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
    this.cleaCertificationResult = cleaCertificationResult;
    this.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    this.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
    this.certificationIssueReports = certificationIssueReports;
  }

  static from({
    juryCertificationDTO,
    certificationIssueReports,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  }) {
    const competenceMarkDTOs = _.compact(juryCertificationDTO.competenceMarks)
      .map((competenceMarkDTO) => new CompetenceMark({
        ...competenceMarkDTO,
      }));

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
      cleaCertificationResult,
      pixPlusDroitMaitreCertificationResult,
      pixPlusDroitExpertCertificationResult,
      certificationIssueReports,
    });
  }
}

function _getStatus(assessmentResultStatus, isCourseCancelled) {
  if (isCourseCancelled) return status.CANCELLED;
  return assessmentResultStatus;
}

module.exports = JuryCertification;
