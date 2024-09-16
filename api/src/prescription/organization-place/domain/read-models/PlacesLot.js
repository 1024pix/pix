import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { validateEntity } from '../../../../shared/domain/validators/entity-validator.js';

const validationSchema = Joi.object({
  id: Joi.number().required(),
  count: Joi.number().required().allow(null),
  organizationId: Joi.number(),
  activationDate: Joi.date().required(),
  expirationDate: Joi.date().required().allow(null),
  deletedAt: Joi.date().required().allow(null),
});

const statuses = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING',
};

export class PlacesLot {
  #id;
  #activationDate;
  #expirationDate;
  #deletedAt;
  constructor(params = {}) {
    validateEntity(validationSchema, params);
    this.#id = params.id;
    this.count = params.count;
    this.organizationId = params.organizationId;
    this.#activationDate = params.activationDate;
    this.#expirationDate = params.expirationDate;
    this.#deletedAt = params.deletedAt;
  }

  get id() {
    return this.#id;
  }

  get isActive() {
    return this.status === statuses.ACTIVE && !this.#deletedAt;
  }

  get activationDate() {
    return this.#activationDate;
  }

  get expirationDate() {
    return this.#expirationDate;
  }

  get status() {
    const today = new Date();

    if (Boolean(this.#expirationDate) && this.#expirationDate < today) {
      return statuses.EXPIRED;
    }

    if (this.#activationDate < today) {
      return statuses.ACTIVE;
    }

    return statuses.PENDING;
  }
}
