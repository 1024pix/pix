const Joi = require('@hapi/joi');
const { InvalidCertificationIssueReportForSaving } = require('../errors');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('./CertificationIssueReportCategory');

const categoryOtherJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.OTHER),
  description: Joi.string().trim().required(),
  subcategory: Joi.string().min(0).max(0).allow('').allow(null).optional(),
});

const categoryLateOrLeavingJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.LATE_OR_LEAVING),
  description: Joi.string().trim().required(),
  subcategory: Joi.string().required().valid(CertificationIssueReportSubcategories.LEFT_EXAM_ROOM, CertificationIssueReportSubcategories.SIGNATURE_ISSUE),
});

const categoryCandidateInformationChangesJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES),
  description: Joi.string().trim().required(),
  subcategory: Joi.string().required().valid(CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE, CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE),
});

const categoryConnectionOrEndScreenJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN),
  description: Joi.string().trim().min(0).max(0).allow('').allow(null).optional(),
  subcategory: Joi.string().min(0).max(0).allow('').allow(null).optional(),
});

const categorySchemas = {
  [CertificationIssueReportCategories.OTHER]: categoryOtherJoiSchema,
  [CertificationIssueReportCategories.LATE_OR_LEAVING]: categoryLateOrLeavingJoiSchema,
  [CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: categoryCandidateInformationChangesJoiSchema,
  [CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN]: categoryConnectionOrEndScreenJoiSchema,
};

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
    const schemaToUse = categorySchemas[this.category];
    if (!schemaToUse) {
      throw new InvalidCertificationIssueReportForSaving(`Unknown category : ${this.category}`);
    }
    const { error } = schemaToUse.validate(this, { allowUnknown: true });
    if (error) {
      throw new InvalidCertificationIssueReportForSaving(error);
    }
  }
}

module.exports = CertificationIssueReport;
