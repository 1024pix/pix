/**
 * @typedef {import('../../../../../evaluation/domain/models/Answer.js')} Answer
 */

export class AssessmentSheet {

  /**
   * @param {object} params
   * @param {number} params.certificationCourseId
   * @param {number} params.assessmentId
   * @param {string} params.abortReason
   * @param {number} params.maxReachableLevelOnCertificationDate
   * @param {boolean} params.isRejectedForFraud
   * @param {Answer[]} params.answers
   */
  constructor({ certificationCourseId, assessmentId, abortReason, maxReachableLevelOnCertificationDate, isRejectedForFraud, answers }) {
    this.certificationCourseId = certificationCourseId;
    this.assessmentId = assessmentId;
    this.abortReason = abortReason;
    this.maxReachableLevelOnCertificationDate = maxReachableLevelOnCertificationDate;
    this.isRejectedForFraud = isRejectedForFraud;
    this.answers = answers;
    this.reconciledAt = reconciledAt;
  }
}
