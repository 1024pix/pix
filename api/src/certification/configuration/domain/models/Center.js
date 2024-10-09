import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  static #schema = Joi.object({
    id: Joi.number().integer().allow(null).optional(),
    type: Joi.string().required(),
    externalId: Joi.string().allow(null, '').optional(),
  });

  /**
   * @param {Object} props
   * @param {CenterTypes} props.type
   * @param {number} props.[id]
   * @param {string} props.[externalId]
   */
  constructor({ id, externalId, type }) {
    this.id = id;
    this.type = type;
    this.externalId = externalId;

    this.#validate();
  }

  #validate() {
    const { error } = Center.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
