const Joi = require('@hapi/joi');
const { InvalidCertificationIssueReportForSaving } = require('../errors');
const { CertificationIssueReportCategories } = require('./CertificationIssueReportCategory');

const certificationIssueReportValidationJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(...Object.values(CertificationIssueReportCategories)),
  description: Joi.string().allow(null).optional(),
});

class CertificationIssueReport {
  constructor(
    {
      id,
      certificationCourseId,
      category,
      description,

    } = {}) {
    this.id = id;
    this.certificationCourseId = certificationCourseId;
    this.category = category;
    this.description = description;
  }

  validateForSaving() {
    const { error } = certificationIssueReportValidationJoiSchema.validate(this, { allowUnknown: true });
    if (error) {
      throw new InvalidCertificationIssueReportForSaving(error);
    }
  }
}

module.exports = CertificationIssueReport;
