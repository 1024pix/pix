/**
 * @typedef {import('../../../../../evaluation/domain/models/Answer.js')} Answer
 */

export const ABORT_REASONS = {
  CANDIDATE: 'candidate',
  TECHNICAL: 'technical',
};

export class AssessmentSheet {
  /**
   * @param {object} params
   * @param {number} params.certificationCourseId
   * @param {number} params.assessmentId
   * @param {ABORT_REASONS} params.abortReason
   * @param {number} params.maxReachableLevelOnCertificationDate
   * @param {boolean} params.isRejectedForFraud
   * @param {Answer[]} params.answers
   */
  constructor({
    certificationCourseId,
    assessmentId,
    abortReason,
    maxReachableLevelOnCertificationDate,
    isRejectedForFraud,
    answers,
  }) {
    this.certificationCourseId = certificationCourseId;
    this.assessmentId = assessmentId;
    this.abortReason = abortReason;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this.isRejectedForFraud = isRejectedForFraud;
    this.answers = answers;
  }

  get isAbortReasonTechnical() {
    return this.abortReason === ABORT_REASONS.TECHNICAL;
  }
}
