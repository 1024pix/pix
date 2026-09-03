import { DomainError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { isEduFramework } from '../../../shared/domain/models/Frameworks.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';

export class JuryCertification {
  /**
   * @param {object} props
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
   * @param {string} props.status
   * @param {boolean} props.isPublished
   * @param {boolean} props.isRejectedForFraud
   * @param {number} props.juryId
   * @param {number} props.pixScore
   * @param {number} props.reachedMeshIndex
   * @param {string} props.eduV3ExternalJuryResult
   * @param {Array<CompetenceMark>} props.competenceMarks
   * @param {JuryComment} props.commentForCandidate
   * @param {JuryComment} props.commentForOrganization
   * @param {string} props.commentByJury
   * @param {Array<string>} props.certificationIssueReports
   * @param {object} props.complementaryCertificationCourseResultWithExternal
   * @param {object} props.commonComplementaryCertificationCourseResult
   * @param {string} props.version
   * @param {Date} props.lastAnswerAt
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
    status,
    isPublished,
    isRejectedForFraud,
    juryId,
    pixScore,
    reachedMeshIndex,
    eduV3ExternalJuryResult,
    competenceMarks,
    commentForCandidate,
    commentForOrganization,
    commentByJury,
    certificationIssueReports,
    complementaryCertificationCourseResultWithExternal,
    commonComplementaryCertificationCourseResult,
    version,
    certificationFramework,
    lastAnswerAt,
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
    this.status = status;
    this.isPublished = isPublished;
    this.isRejectedForFraud = isRejectedForFraud;
    this.juryId = juryId;
    this.pixScore = pixScore;
    this.reachedMeshIndex = reachedMeshIndex;
    this.eduV3ExternalJuryResult = eduV3ExternalJuryResult;
    this.competenceMarks = competenceMarks;
    this.commentForCandidate = commentForCandidate;
    this.commentForOrganization = commentForOrganization;
    this.commentByJury = commentByJury;
    this.certificationIssueReports = certificationIssueReports;
    this.complementaryCertificationCourseResultWithExternal = complementaryCertificationCourseResultWithExternal;
    this.commonComplementaryCertificationCourseResult = commonComplementaryCertificationCourseResult;
    this.version = version;
    this.certificationFramework = certificationFramework;
    this.lastAnswerAt = lastAnswerAt;
  }

  get reachedResultKey() {
    if (this.version !== AlgorithmEngineVersion.V3) {
      return `${this.certificationFramework}.NONE`;
    }

    if (this.status === 'pending-scoring') {
      return null;
    }

    const resultKey = this.eduV3ExternalJuryResult || (this.reachedMeshIndex ?? 'BELOW_MINIMUM');

    return `${this.certificationFramework}.${resultKey}`;
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
      status:
        juryCertificationDTO.assessmentResultStatus ??
        (juryCertificationDTO.hasScoringConfiguration ? null : 'pending-scoring'),
      isPublished: juryCertificationDTO.isPublished,
      isRejectedForFraud: juryCertificationDTO.isRejectedForFraud,
      juryId: juryCertificationDTO.juryId,
      pixScore: juryCertificationDTO.pixScore,
      reachedMeshIndex: juryCertificationDTO.reachedMeshIndex,
      eduV3ExternalJuryResult: juryCertificationDTO.eduV3ExternalJuryResult,
      competenceMarks,
      commentForCandidate,
      commentForOrganization,
      commentByJury: juryCertificationDTO.commentByJury,
      certificationIssueReports,
      complementaryCertificationCourseResultWithExternal,
      commonComplementaryCertificationCourseResult,
      version: juryCertificationDTO.version,
      certificationFramework: juryCertificationDTO.certificationFramework,
      lastAnswerAt: juryCertificationDTO.lastAnswerAt,
    });
  }

  updateEduV3ExternalJuryResult(eduV3ExternalJuryResult) {
    if (!this.isPublished) {
      throw new DomainError('Impossible de définir le résultat du volet externe pour une certification non publiée');
    }
    if (this.status !== AssessmentResult.status.VALIDATED) {
      throw new DomainError('Impossible de définir le résultat du volet externe pour une certification non validée');
    }
    if (this.version !== AlgorithmEngineVersion.V3) {
      throw new DomainError('Impossible de définir le résultat du volet externe pour une certification non V3');
    }

    if (!isEduFramework(this.certificationFramework)) {
      throw new DomainError('Impossible de définir le résultat du volet externe pour une certification non "EDU"');
    }

    if (this.reachedMeshIndex === null) {
      throw new DomainError(
        'Impossible de définir le résultat du volet externe pour une certification EDU non admissible',
      );
    }

    this.eduV3ExternalJuryResult = eduV3ExternalJuryResult;
  }
}
