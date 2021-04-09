class CertificationResultInformation {
  constructor(
    {
      certificationCourseId,

      sessionId,
      status,
      createdAt,
      completedAt,
      isPublished,
      isV2Certification,
      cleaCertificationStatus,

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
    this.isV2Certification = isV2Certification;
    this.cleaCertificationStatus = cleaCertificationStatus;

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
    cleaCertificationStatus,
  }) {
    return new CertificationResultInformation({
      certificationCourseId: generalCertificationInformation.certificationCourseId,
      sessionId: generalCertificationInformation.sessionId,
      status: assessmentResult.status,
      createdAt: generalCertificationInformation.createdAt,
      completedAt: generalCertificationInformation.completedAt,
      isPublished: generalCertificationInformation.isPublished,
      isV2Certification: generalCertificationInformation.isV2Certification,
      cleaCertificationStatus,
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

module.exports = CertificationResultInformation;
