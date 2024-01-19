import { CompetenceMark } from './CompetenceMark.js';

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
    isRejectedForFraud,
    juryId,
    pixScore,
    competenceMarks,
    commentForCandidate,
    commentForOrganization,
    commentByJury,
    certificationIssueReports,
    complementaryCertificationCourseResultWithExternal,
    commonComplementaryCertificationCourseResult,
    version,
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
    this.isRejectedForFraud = isRejectedForFraud;
    this.juryId = juryId;
    this.pixScore = pixScore;
    this.competenceMarks = competenceMarks;
    this.commentForCandidate = commentForCandidate;
    this.commentForOrganization = commentForOrganization;
    this.commentByJury = commentByJury;
    this.certificationIssueReports = certificationIssueReports;
    this.complementaryCertificationCourseResultWithExternal = complementaryCertificationCourseResultWithExternal;
    this.commonComplementaryCertificationCourseResult = commonComplementaryCertificationCourseResult;
    this.version = version;
  }

  static from({
    juryCertificationDTO,
    certificationIssueReports,
    competenceMarkDTOs,
    complementaryCertificationCourseResultWithExternal,
    commonComplementaryCertificationCourseResult,
  }) {
    const competenceMarks = competenceMarkDTOs.map(
      (competenceMarkDTO) =>
        new CompetenceMark({
          ...competenceMarkDTO,
        }),
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
      isRejectedForFraud: juryCertificationDTO.isRejectedForFraud,
      juryId: juryCertificationDTO.juryId,
      pixScore: juryCertificationDTO.pixScore,
      competenceMarks,
      commentForCandidate: juryCertificationDTO.commentForCandidate,
      commentForOrganization: juryCertificationDTO.commentForOrganization,
      commentByJury: juryCertificationDTO.commentByJury,
      certificationIssueReports,
      complementaryCertificationCourseResultWithExternal,
      commonComplementaryCertificationCourseResult,
      version: juryCertificationDTO.version,
    });
  }
}

export { JuryCertification };
