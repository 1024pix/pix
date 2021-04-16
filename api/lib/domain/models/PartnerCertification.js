const Joi = require('joi')
  .extend(require('@joi/date'));
const { validateEntity } = require('../validators/entity-validator');
const { NotImplementedError } = require('../errors');

class PartnerCertification {
  constructor(
    {
      certificationCourseId,
      partnerKey,
    } = {}) {
    this.certificationCourseId = certificationCourseId;
    this.partnerKey = partnerKey;
    const schema = Joi.object({
      certificationCourseId: Joi.number().integer().required(),
      partnerKey: Joi.string().required(),
    });
    validateEntity(schema, this);
  }

  isAcquired() {
    throw new NotImplementedError();
  }
}

module.exports = PartnerCertification;
