const Joi = require('@hapi/joi');
const { InvalidCertificationIssueReportForSaving } = require('../errors');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('./CertificationIssueReportCategory');

const categoryOtherJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.OTHER),
  description: Joi.string().trim().required(),
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
});

const categoryInChallengeJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.IN_CHALLENGE),
  questionNumber: Joi.number().min(1).max(500).required(),
  subcategory: Joi.string().required().valid(
    CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
    CertificationIssueReportSubcategories.LINK_NOT_WORKING,
    CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
    CertificationIssueReportSubcategories.FILE_NOT_OPENING,
    CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
    CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
    CertificationIssueReportSubcategories.OTHER,
  ),
  description: Joi.string()
    .when('subcategory', {
      switch: [
        { is: Joi.valid(
          CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
          CertificationIssueReportSubcategories.LINK_NOT_WORKING,
          CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
          CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
          CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
        ), then: Joi.string().min(0).max(0).allow('').allow(null).optional() },
      ],
      otherwise: Joi.string().trim().required(),
    }),
});

const categoryFraudJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.FRAUD),
});

const categoryTechnicalProblemJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.TECHNICAL_PROBLEM),
  description: Joi.string().trim().required(),
});

const categorySchemas = {
  [CertificationIssueReportCategories.OTHER]: categoryOtherJoiSchema,
  [CertificationIssueReportCategories.LATE_OR_LEAVING]: categoryLateOrLeavingJoiSchema,
  [CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: categoryCandidateInformationChangesJoiSchema,
  [CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN]: categoryConnectionOrEndScreenJoiSchema,
  [CertificationIssueReportCategories.IN_CHALLENGE]: categoryInChallengeJoiSchema,
  [CertificationIssueReportCategories.FRAUD]: categoryFraudJoiSchema,
  [CertificationIssueReportCategories.TECHNICAL_PROBLEM]: categoryTechnicalProblemJoiSchema,
};

class CertificationIssueReport {
  constructor(
    {
      id,
      certificationCourseId,
      category,
      description,
      subcategory,
      questionNumber,
    } = {}) {
    this.id = id;
    this.certificationCourseId = certificationCourseId;
    this.category = category;
    this.subcategory = subcategory;
    this.description = description;
    this.questionNumber = questionNumber;

    if ([CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN, CertificationIssueReportCategories.OTHER].includes(this.category)) {
      this.subcategory = null;
    }

    if (this.category === CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN) {
      this.description = null;
    }

    if (this.category !== CertificationIssueReportCategories.IN_CHALLENGE) {
      this.questionNumber = null;
    }
  }

  static new({
    id,
    certificationCourseId,
    category,
    description,
    subcategory,
    questionNumber,
  }) {
    const certificationIssueReport = new CertificationIssueReport({
      id,
      certificationCourseId,
      category,
      description,
      subcategory,
      questionNumber,
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
