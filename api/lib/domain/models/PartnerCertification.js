const Joi = require('@hapi/joi')
  .extend(require('@hapi/joi-date'));
const { validateEntity } = require('../validators/entity-validator');

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

  isEligible() {}

  isAcquired() {}
}

module.exports = PartnerCertification;
