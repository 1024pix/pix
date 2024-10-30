import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

export class Candidate {
  static #schema = Joi.object({
    id: Joi.number().integer().required(),
    reconciledAt: Joi.date().required(),
  });

  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {Date} props.reconciledAt
   */
  constructor({ id, reconciledAt }) {
    this.id = id;
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
