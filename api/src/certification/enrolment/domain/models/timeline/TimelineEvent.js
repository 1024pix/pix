// @ts-check

import Joi from 'joi';

import { EntityValidationError } from '../../../../../shared/domain/errors.js';

export class TimelineEvent {
  static #schema = Joi.object({
    code: Joi.string().required(),
    when: Joi.date().required(),
    metadata: Joi.object().required(),
  });

  /**
   * @param {object} props
   * @param {string} props.code
   * @param {Date} props.when
   * @param {Record<string, unknown>} [props.metadata]
   */
  constructor({ code, when, metadata = {} }) {
    this.code = code;
    this.when = when;
    this.metadata = metadata;
    this.#validate();
  }

  #validate() {
    const { error } = TimelineEvent.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
