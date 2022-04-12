const Joi = require('joi').extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const { NotImplementedError } = require('../errors');

const SOURCES = {
  PIX: 'PIX',
  EXTERNAL: 'EXTERNAL',
};

class PartnerCertificationScoring {
  constructor({ complementaryCertificationCourseId, partnerKey, source = 'PIX' } = {}) {
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
