import _ from 'lodash';

import { CompetenceMark } from '../../../src/certification/results/domain/models/CompetenceMark.js';
import { JuryComment, JuryCommentContexts } from '../../../src/certification/shared/domain/models/JuryComment.js';
import { ComplementaryCertificationCourseResult } from './ComplementaryCertificationCourseResult.js';

/**
 * @readonly
 * @enum {string}
 */
const status = {
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  STARTED: 'started',
};

/**
 * @readonly
 * @enum {string}
 */
const emitters = {
  PIX_ALGO: 'PIX-ALGO',
  PIX_ALGO_AUTO_JURY: 'PIX-ALGO-AUTO-JURY',
  PIX_ALGO_NEUTRALIZATION: 'PIX-ALGO-NEUTRALIZATION',
  PIX_ALGO_FRAUD_REJECTION: 'PIX-ALGO-FRAUD-REJECTION',
};

class CertificationResult {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {string} props.firstName
   * @param {string} props.lastName
   * @param {string} props.birthplace
   * @param {number} props.externalId
   * @param {Date} props.createdAt
   * @param {number} props.sessionId
   * @param {status} props.status
   * @param {number} props.pixScore
   * @param {string} props.emitter
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
        }),
    );
    const complementaryCertificationCourseResults = _.compact(
      certificationResultDTO.complementaryCertificationCourseResults,
    ).map(
      (complementaryCertifCourseResult) => new ComplementaryCertificationCourseResult(complementaryCertifCourseResult),
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
      pixScore: certificationResultDTO.pixScore,
      emitter: certificationResultDTO.emitter,
      commentForOrganization,
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

  getUniqComplementaryCertificationCourseResultLabels() {
    return [
      ...new Set(
        _(this.complementaryCertificationCourseResults)
          .orderBy('id')
          .map(({ label }) => label)
          .value(),
      ),
    ];
  }
}

CertificationResult.status = status;
CertificationResult.emitters = emitters;
export { CertificationResult };
