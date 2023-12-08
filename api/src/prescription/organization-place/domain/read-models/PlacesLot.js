import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { validateEntity } from '../../../../../lib/domain/validators/entity-validator.js';

const validationSchema = Joi.object({
  count: Joi.number().required().allow(null),
  activationDate: Joi.date().required(),
  expirationDate: Joi.date().required().allow(null),
  deletedAt: Joi.date().required().allow(null),
});

export class PlacesLot {
  #activationDate;
  #expirationDate;
  #deletedAt;
  constructor(params = {}) {
    validateEntity(validationSchema, params);
    this.count = params.count === null ? 0 : params.count;
    this.#activationDate = params.activationDate;
    this.#expirationDate = params.expirationDate;
    this.#deletedAt = params.deletedAt;
  }

  get isActive() {
    return this.#expirationDate > Date.now() && this.#activationDate < Date.now() && !this.#deletedAt;
  }
}
