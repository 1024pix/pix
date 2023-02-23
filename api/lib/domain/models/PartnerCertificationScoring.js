const BaseJoi = require('joi');
const JoiDate = require('@joi/date');
const Joi = BaseJoi.extend(JoiDate);
const { validateEntity } = require('../validators/entity-validator.js');
const { NotImplementedError } = require('../errors.js');

const SOURCES = {
  PIX: 'PIX',
  EXTERNAL: 'EXTERNAL',
};

class PartnerCertificationScoring {
  constructor({ complementaryCertificationCourseId, partnerKey, source = SOURCES.PIX } = {}) {
    this.complementaryCertificationCourseId = complementaryCertificationCourseId;
    this.partnerKey = partnerKey;
    this.source = source;
    const schema = Joi.object({
      complementaryCertificationCourseId: Joi.number().integer().required(),
      partnerKey: Joi.string().allow(null).required(),
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

module.exports = PartnerCertificationScoring;
