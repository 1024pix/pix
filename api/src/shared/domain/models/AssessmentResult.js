/**
 * @typedef {import('../../../certification/shared/domain/models/CompetenceMark.js').CompetenceMark} CompetenceMark
 * @typedef {import('../../../certification/shared/domain/models/JuryComment.js').JuryComment} JuryComment
 */
import { NotFinalizedSessionError } from '../errors.js';
import { Assessment } from './Assessment.js';

/**
 * @readonly
 * @enum {string}
 */
const status = Object.freeze({
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  VALIDATED: 'validated',
  ERROR: 'error',
});

class AssessmentResult {
  /**
   * @param {number} id
   * @param {JuryComment} commentForCandidate
   * @param {string} commentByJury
   * @param {JuryComment} commentForOrganization
   * @param {Date} createdAt
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

  cancel() {
    if (!Object.values(AssessmentResult.status).includes(this.status)) {
      throw new NotFinalizedSessionError();
    }
    this.status = AssessmentResult.status.CANCELLED;
  }
}

AssessmentResult.status = status;
export { AssessmentResult, status };
