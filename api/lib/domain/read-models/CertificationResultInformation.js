const status = {
  CANCELLED: 'cancelled',
};

class CertificationResultInformation {
  constructor({
    certificationCourseId,
    sessionId,
    status,
    createdAt,
    completedAt,
    isPublished,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    firstName,
    lastName,
    birthdate,
    birthplace,
    certificationIssueReports,
    assessmentId,
    commentForCandidate,
    commentForOrganization,
    commentForJury,
    juryId,
    pixScore,
    competenceMarks,
  } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.sessionId = sessionId;
    this.status = status;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.cleaCertificationResult = cleaCertificationResult;
    this.pixPlusDroitMaitreCertificationResult = pixPlusDroitMaitreCertificationResult;
    this.pixPlusDroitExpertCertificationResult = pixPlusDroitExpertCertificationResult;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.certificationIssueReports = certificationIssueReports;
    this.assessmentId = assessmentId;
    this.commentForCandidate = commentForCandidate;
    this.commentForOrganization = commentForOrganization;
    this.commentForJury = commentForJury;
    this.juryId = juryId;
    this.pixScore = pixScore;
    this.competenceMarks = competenceMarks;
  }

  static from({
    generalCertificationInformation,
    assessmentResult,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  }) {
    return new CertificationResultInformation({
      certificationCourseId: generalCertificationInformation.certificationCourseId,
      sessionId: generalCertificationInformation.sessionId,
      status: _getStatus(assessmentResult.status, generalCertificationInformation.isCancelled),
      createdAt: generalCertificationInformation.createdAt,
      completedAt: generalCertificationInformation.completedAt,
      isPublished: generalCertificationInformation.isPublished,
      cleaCertificationResult,
      pixPlusDroitMaitreCertificationResult,
      pixPlusDroitExpertCertificationResult,
      firstName: generalCertificationInformation.firstName,
      lastName: generalCertificationInformation.lastName,
      birthdate: generalCertificationInformation.birthdate,
      birthplace: generalCertificationInformation.birthplace,
      certificationIssueReports: generalCertificationInformation.certificationIssueReports,
      assessmentId: assessmentResult.assessmentId,
      commentForCandidate: assessmentResult.commentForCandidate,
      commentForOrganization: assessmentResult.commentForOrganization,
      commentForJury: assessmentResult.commentForJury,
      juryId: assessmentResult.juryId,
      pixScore: assessmentResult.pixScore,
      competenceMarks: assessmentResult.competenceMarks,
    });
  }
}

function _getStatus(assessmentResultStatus, isCourseCancelled) {
  if (isCourseCancelled) return status.CANCELLED;
  return assessmentResultStatus;
}

module.exports = CertificationResultInformation;
