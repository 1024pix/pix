import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

export class Candidate {
  static #schema = Joi.object({
    accessibilityAdjustmentNeeded: Joi.boolean().optional(),
    reconciledAt: Joi.date().required(),
  });

  /**
   * @param {Object} params
   * @param {Date} params.reconciledAt
   * @param {boolean} [params.accessibilityAdjustmentNeeded]
   */
  constructor({ accessibilityAdjustmentNeeded, reconciledAt } = {}) {
    this.accessibilityAdjustmentNeeded = !!accessibilityAdjustmentNeeded;
    this.reconciledAt = reconciledAt;

    this.#validate();
  }

  #validate() {
    const { error } = Candidate.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
