import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import { NotImplementedError } from '../../../src/shared/domain/errors.js';
import { validateEntity } from '../../../src/shared/domain/validators/entity-validator.js';

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
    hasAcquiredPixCertification,
  } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.source = source;
    this.isRejectedForFraud = isRejectedForFraud;
    this.hasAcquiredPixCertification = hasAcquiredPixCertification;
    const schema = Joi.object({
      complementaryCertificationCourseId: Joi.number().integer().required(),
      complementaryCertificationBadgeId: Joi.number().integer().required(),
      isRejectedForFraud: Joi.boolean().required(),
      hasAcquiredPixCertification: Joi.boolean().required(),
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
