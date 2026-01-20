/**
 * @typedef {import('../../../../evaluation/domain/models/Answer.js')} Answer
 */

import Joi from 'joi';

import { Answer } from '../../../../evaluation/domain/models/Answer.js';
import { EntityValidationError } from '../../../../shared/domain/errors.js';

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
  static #schema = Joi.object({
    certificationCourseId: Joi.number().required(),
    assessmentId: Joi.number().required(),
    abortReason: Joi.string()
      .valid(...Object.values(ABORT_REASONS))
      .allow(null),
    maxReachableLevelOnCertificationDate: Joi.number().required(),
    isRejectedForFraud: Joi.boolean().required(),
    answers: Joi.array().items(Joi.object().instance(Answer)).required(),
  });

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
    this.#validate();
  }

  #validate() {
    const { error } = AssessmentSheet.#schema.validate(this, { allowUnknown: false });
    if (error) {
      console.log(error);
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }

  get isAbortReasonTechnical() {
    return this.abortReason === ABORT_REASONS.TECHNICAL;
  }
}
