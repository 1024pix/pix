const CompetenceMark = require('./CompetenceMark');

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
    isCancelled,
    isPublished,
    juryId,
    pixScore,
    competenceMarks,
    commentForCandidate,
    commentForOrganization,
    commentForJury,
    certificationIssueReports,
    complementaryCertificationCourseResultsWithExternal,
    commonComplementaryCertificationCourseResults,
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
    this.isCancelled = isCancelled;
    this.isPublished = isPublished;
    this.juryId = juryId;
    this.pixScore = pixScore;
    this.competenceMarks = competenceMarks;
    this.commentForCandidate = commentForCandidate;
    this.commentForOrganization = commentForOrganization;
    this.commentForJury = commentForJury;
    this.certificationIssueReports = certificationIssueReports;
    this.complementaryCertificationCourseResultsWithExternal = complementaryCertificationCourseResultsWithExternal;
    this.commonComplementaryCertificationCourseResults = commonComplementaryCertificationCourseResults;
  }

  static from({
    juryCertificationDTO,
    certificationIssueReports,
    competenceMarkDTOs,
    complementaryCertificationCourseResultsWithExternal,
    commonComplementaryCertificationCourseResults,
  }) {
    const competenceMarks = competenceMarkDTOs.map(
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
      status: juryCertificationDTO.assessmentResultStatus,
      isCancelled: juryCertificationDTO.isCancelled,
      isPublished: juryCertificationDTO.isPublished,
      juryId: juryCertificationDTO.juryId,
      pixScore: juryCertificationDTO.pixScore,
      competenceMarks,
      commentForCandidate: juryCertificationDTO.commentForCandidate,
      commentForOrganization: juryCertificationDTO.commentForOrganization,
      commentForJury: juryCertificationDTO.commentForJury,
      certificationIssueReports,
      complementaryCertificationCourseResultsWithExternal,
      commonComplementaryCertificationCourseResults,
    });
  }
}

module.exports = JuryCertification;
