import { CompetenceMark } from '../../../results/domain/models/CompetenceMark.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';

class JuryCertification {
  /**
   * @param {Object} props
   * @param {number} props.certificationCourseId
   * @param {number} props.sessionId
   * @param {number} props.userId
   * @param {number} props.assessmentId
   * @param {string} props.firstName
   * @param {string} props.lastName
   * @param {string} props.birthplace
   * @param {string} props.birthINSEECode
   * @param {string} props.birthCountry
   * @param {string} props.birthPostalCode
   * @param {Date} props.createdAt
   * @param {Date} props.completedAt
   * @param {string} props.status
   * @param {boolean} props.isCancelled
   * @param {boolean} props.isPublished
   * @param {boolean} props.isRejectedForFraud
   * @param {number} props.juryId
   * @param {number} props.pixScore
   * @param {Array<CompetenceMark>} props.competenceMarks
   * @param {JuryComment} props.commentForCandidate
   * @param {JuryComment} props.commentForOrganization
   * @param {string} props.commentByJury
   * @param {Array<string>} props.certificationIssueReports
   * @param {Object} props.complementaryCertificationCourseResultWithExternal
   * @param {Object} props.commonComplementaryCertificationCourseResult
   * @param {string} props.version
   */
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

    const {
      commentByAutoJury,
      commentForCandidate: manualCommentForCandidate,
      commentForOrganization: manualCommentForOrganization,
    } = juryCertificationDTO;
    const commentForCandidate = new JuryComment({
      commentByAutoJury,
      fallbackComment: manualCommentForCandidate,
      context: JuryCommentContexts.CANDIDATE,
    });
    const commentForOrganization = new JuryComment({
      commentByAutoJury,
      fallbackComment: manualCommentForOrganization,
      context: JuryCommentContexts.ORGANIZATION,
    });

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
      commentForCandidate,
      commentForOrganization,
      commentByJury: juryCertificationDTO.commentByJury,
      certificationIssueReports,
      complementaryCertificationCourseResultWithExternal,
      commonComplementaryCertificationCourseResult,
      version: juryCertificationDTO.version,
    });
  }
}

export { JuryCertification };
