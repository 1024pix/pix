import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);
import { validateEntity } from '../validators/entity-validator.js';
import { NotImplementedError } from '../errors.js';

const SOURCES = {
  PIX: 'PIX',
  EXTERNAL: 'EXTERNAL',
};

class PartnerCertificationScoring {
  constructor({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId,
    source = SOURCES.PIX,
    isRejectedForFraud = false,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.source = source;
    this.isRejectedForFraud = isRejectedForFraud;
    const schema = Joi.object({
      complementaryCertificationCourseId: Joi.number().integer().required(),
      complementaryCertificationBadgeId: Joi.number().integer().required(),
      isRejectedForFraud: Joi.boolean().required(),
      source: Joi.string()
        .required()
        .valid(...Object.values(SOURCES)),
    });
    validateEntity(schema, this);
  }

  isAcquired() {
    throw new NotImplementedError();
  }
}

export { PartnerCertificationScoring };
