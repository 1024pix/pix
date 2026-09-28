import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';
import { ComplementaryCertificationCourseResult } from '../../../shared/domain/models/ComplementaryCertificationCourseResult.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';

export class CertificationResult {
  /**
   * @param {object} props
   * @param {number} props.id
   * @param {string} props.firstName
   * @param {string} props.lastName
   * @param {string} props.birthplace
   * @param {number} props.externalId
   * @param {Date} props.createdAt
   * @param {number} props.sessionId
   * @param {status} props.status
   * @param {string} props.framework
   * @param {number} props.reachedMeshIndex
   * @param {number} props.pixScore
   * @param {number} props.version
   * @param {JuryComment} props.commentForOrganization
   * @param {Array<CompetenceMark>} props.competencesWithMark
   * @param {Array<ComplementaryCertificationCourseResult>} props.complementaryCertificationCourseResults
   */
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
    framework,
    reachedMeshIndex,
    pixScore,
    version,
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
    this.framework = framework;
    this.reachedMeshIndex = reachedMeshIndex;
    this.pixScore = pixScore;
    this.version = version;
    this.commentForOrganization = commentForOrganization;
    this.competencesWithMark = competencesWithMark;
    this.complementaryCertificationCourseResults = complementaryCertificationCourseResults;
  }

  static from({ certificationResultDTO }) {
    const certificationStatus = certificationResultDTO?.assessmentResultStatus ?? CertificationResult.status.STARTED;
    const competenceMarkDTOs = certificationResultDTO.competenceMarks.filter(Boolean);
    const competencesWithMark = competenceMarkDTOs.map(
      (competenceMarkDTO) =>
        new CompetenceMark({
          ...competenceMarkDTO,
          area_code: competenceMarkDTO.area_code.toString(),
          competence_code: competenceMarkDTO.competence_code.toString(),
        }),
    );
    const complementaryCertificationCourseResults = certificationResultDTO.complementaryCertificationCourseResults
      .filter(Boolean)
      .map(
        (complementaryCertifCourseResult) =>
          new ComplementaryCertificationCourseResult(complementaryCertifCourseResult),
      );

    const commentForOrganization = new JuryComment({
      fallbackComment: certificationResultDTO.commentForOrganization,
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: certificationResultDTO.commentByAutoJury,
    });

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
      framework: certificationResultDTO.framework,
      reachedMeshIndex: certificationResultDTO.reachedMeshIndex,
      pixScore: certificationResultDTO.pixScore,
      version: certificationResultDTO.version,
      commentForOrganization,
      competencesWithMark,
      complementaryCertificationCourseResults,
    });
  }

  isCancelled() {
    return this.status === CertificationResult.status.CANCELLED;
  }

  isValidated() {
    return this.status === CertificationResult.status.VALIDATED;
  }

  isRejected() {
    return this.status === CertificationResult.status.REJECTED;
  }

  isInError() {
    return this.status === CertificationResult.status.ERROR;
  }

  isStarted() {
    return this.status === CertificationResult.status.STARTED;
  }

  isCleaFramework() {
    return this.framework === Frameworks.CLEA;
  }

  isCoreFramework() {
    return this.framework === Frameworks.CORE;
  }

  getUniqComplementaryCertificationCourseResultLabels() {
    const sortedComplementaryCertifCourseResults = this.complementaryCertificationCourseResults.toSorted((a, b) => {
      return a['id'] > b['id'] ? 1 : b['id'] > a['id'] ? -1 : 0;
    });
    const sortedLabels = sortedComplementaryCertifCourseResults.map(({ label }) => label);
    return [...new Set(Object.values(sortedLabels))];
  }

  get isV3() {
    return this.version === AlgorithmEngineVersion.V3;
  }
}

/**
 * @readonly
 * @enum {string}
 */
CertificationResult.status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  STARTED: 'started',
};
