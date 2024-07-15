/**
 * @typedef {import('../../../certification/results/domain/models/CompetenceMark.js').CompetenceMark} CompetenceMark
 * @typedef {import('../../../certification/shared/domain/models/JuryComment.js').JuryComment} JuryComment
 */
import { Assessment } from './Assessment.js';

/**
 * @readonly
 * @enum {string}
 */
const status = Object.freeze({
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
});

/**
 * @readonly
 * @enum {string}
 */
const emitters = Object.freeze({
  PIX_ALGO: 'PIX-ALGO',
  PIX_JURY: 'Jury Pix',
  PIX_ALGO_FRAUD_REJECTION: 'PIX-ALGO-FRAUD-REJECTION',
});

class AssessmentResult {
  /**
   * @param {number} id
   * @param {JuryComment} commentForCandidate
   * @param {string} commentByJury
   * @param {JuryComment} commentForOrganization
   * @param {Date} createdAt
   * @param {emitters} emitter
   * @param {number} pixScore
   * @param {number} reproducibilityRate
   * @param {status} status
   * @param {Array<CompetenceMark>} competenceMarks
   * @param {number} assessmentId
   * @param {number} juryId
   */
  constructor({
    id,
    commentForCandidate,
    commentByJury,
    commentForOrganization,
    createdAt,
    emitter,
    pixScore,
    reproducibilityRate,
    status,
    competenceMarks = [],
    assessmentId,
    juryId,
  } = {}) {
    this.id = id;
    this.commentForCandidate = commentForCandidate;
    this.commentByJury = commentByJury;
    this.commentForOrganization = commentForOrganization;
    this.createdAt = createdAt;
    this.emitter = emitter;
    this.pixScore = pixScore;
    this.reproducibilityRate = reproducibilityRate;
    this.status = status;
    this.competenceMarks = competenceMarks;
    this.assessmentId = assessmentId;
    this.juryId = juryId;
  }

  /**
   * @deprecated : usage of this method is highly discutable since it is using an `Assessment.states.STARTED`
   *  that is not a valid status known from AssessmentResult (see status enumeration in AssessmentResult)
   */
  static buildStartedAssessmentResult({ assessmentId }) {
    return new AssessmentResult({
      assessmentId,
      status: Assessment.states.STARTED,
    });
  }

  isValidated() {
    return this.status === status.VALIDATED;
  }

  clone() {
    return new AssessmentResult({
      commentForCandidate: this.commentForCandidate?.clone(),
      commentByJury: this.commentByJury,
      commentForOrganization: this.commentForOrganization?.clone(),
      emitter: this.emitter,
      pixScore: this.pixScore,
      reproducibilityRate: this.reproducibilityRate,
      status: this.status,
      competenceMarks: this.competenceMarks,
      assessmentId: this.assessmentId,
      juryId: this.juryId,
    });
  }

  reject() {
    this.status = AssessmentResult.status.REJECTED;
  }
}

AssessmentResult.status = status;
AssessmentResult.emitters = emitters;
export { AssessmentResult, status };
