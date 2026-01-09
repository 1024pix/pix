import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { SCOPES } from '../../../shared/domain/models/Scopes.js';

export class Candidate {
  static #schema = Joi.object({
    accessibilityAdjustmentNeeded: Joi.boolean().optional(),
    reconciledAt: Joi.date().required(),
    subscriptionScope: Joi.string()
      .valid(...Object.values(SCOPES))
      .required(),
    hasCleaSubscription: Joi.boolean().required(),
  });

  /**
   * @param {object} params
   * @param {Date} params.reconciledAt
   * @param {boolean} [params.accessibilityAdjustmentNeeded]
   * @param {SCOPES} params.subscriptionScope
   * @param {boolean} params.hasCleaSubscription
   */
  constructor({ accessibilityAdjustmentNeeded, reconciledAt, subscriptionScope, hasCleaSubscription }) {
    this.accessibilityAdjustmentNeeded = !!accessibilityAdjustmentNeeded;
    this.reconciledAt = reconciledAt;
    this.subscriptionScope = subscriptionScope;
    this.hasCleaSubscription = hasCleaSubscription;

    this.#validate();
  }

  get hasOnlyCoreSubscription() {
    return this.subscriptionScope === SCOPES.CORE && !this.hasCleaSubscription;
  }
  // todo s'entendre sur si on dit encore pix plus ou pas ??!!
  get hasPixPlusSubscription() {
    return this.subscriptionScope !== SCOPES.CORE && !this.hasCleaSubscription;
  }

  #validate() {
    const { error } = Candidate.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
