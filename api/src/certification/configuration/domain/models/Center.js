import Joi from 'joi';

import { config } from '../../../../shared/config.js';
import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { _ } from '../../../../shared/infrastructure/utils/lodash-utils.js';
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

  isInWhitelist() {
    if (this.type !== CenterTypes.SCO) {
      return true;
    }

    if (this.type == CenterTypes.SCO && _.isBlank(this.externalId)) {
      return false;
    }

    return config.features.pixCertifScoBlockedAccessWhitelist.includes(this.externalId.toUpperCase());
  }

  #validate() {
    const { error } = Center.#schema.validate(this, { allowUnknown: false });
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}
