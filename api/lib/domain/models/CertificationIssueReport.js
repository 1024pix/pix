const Joi = require('@hapi/joi');
const { InvalidCertificationIssueReportForSaving } = require('../errors');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('./CertificationIssueReportCategory');

const certificationIssueReportValidationJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(...Object.values(CertificationIssueReportCategories)),
  description: Joi.string().allow(null).optional(),
  subcategory: Joi.string().allow(null).optional().valid(...Object.values(CertificationIssueReportSubcategories)),
});

class CertificationIssueReport {
  constructor(
    {
      id,
      certificationCourseId,
      category,
      description,
      subcategory,
    } = {}) {
    this.id = id;
    this.certificationCourseId = certificationCourseId;
    this.category = category;
    this.description = description;
    this.subcategory = subcategory;
  }

  static new({
    id,
    certificationCourseId,
    category,
    description,
    subcategory,
  }) {
    const certificationIssueReport = new CertificationIssueReport({
      id,
      certificationCourseId,
      category,
      description,
      subcategory,
    });
    certificationIssueReport.validate();
    return certificationIssueReport;
  }

  validate() {
    const { error } = certificationIssueReportValidationJoiSchema.validate(this, { allowUnknown: true });
    if (error) {
      throw new InvalidCertificationIssueReportForSaving(error);
    }
  }
}

module.exports = CertificationIssueReport;
