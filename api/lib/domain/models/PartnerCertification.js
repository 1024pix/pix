const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
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

  isEligible() {
    throw new NotImplementedError();
  }

  isAcquired() {
    throw new NotImplementedError();
  }
}

module.exports = PartnerCertification;
