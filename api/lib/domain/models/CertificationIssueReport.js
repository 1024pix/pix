const Joi = require('joi');
const {
  InvalidCertificationIssueReportForSaving,
  DeprecatedCertificationIssueReportCategoryError,
  DeprecatedCertificationIssueReportSubcategoryError,
} = require('../errors');
const {
  CertificationIssueReportCategories,
  CertificationIssueReportSubcategories,
  ImpactfulCategories,
  ImpactfulSubcategories,
  DeprecatedCategories,
  DeprecatedSubcategories,
} = require('./CertificationIssueReportCategory');

const categoryNonBlockingTechnicalIssueJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE),
  description: Joi.string().trim().required(),
});

const categoryNonBlockingCandidateIssueJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE),
  description: Joi.string().trim().required(),
});

const categorySignatureIssueJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.SIGNATURE_ISSUE),
  description: Joi.string().trim().required(),
});

const categoryCandidateInformationChangesJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES),
  description: Joi.string().trim().required(),
  subcategory: Joi.string()
    .required()
    .valid(
      CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE
    ),
});

const categoryInChallengeJoiSchema = Joi.object({
  certificationCourseId: Joi.number().required().empty(null),
  category: Joi.string().required().valid(CertificationIssueReportCategories.IN_CHALLENGE),
  questionNumber: Joi.number().min(1).max(500).required(),
  subcategory: Joi.string()
    .required()
    .valid(
      CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
      CertificationIssueReportSubcategories.LINK_NOT_WORKING,
      CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
      CertificationIssueReportSubcategories.FILE_NOT_OPENING,
      CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
      CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
      CertificationIssueReportSubcategories.OTHER,
      CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
      CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
      CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
      CertificationIssueReportSubcategories.SKIP_ON_OOPS,
      CertificationIssueReportSubcategories.ACCESSIBILITY_ISSUE
    ),
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
  [CertificationIssueReportCategories.SIGNATURE_ISSUE]: categorySignatureIssueJoiSchema,
  [CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES]: categoryCandidateInformationChangesJoiSchema,
  [CertificationIssueReportCategories.IN_CHALLENGE]: categoryInChallengeJoiSchema,
  [CertificationIssueReportCategories.FRAUD]: categoryFraudJoiSchema,
  [CertificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE]: categoryNonBlockingCandidateIssueJoiSchema,
  [CertificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE]: categoryNonBlockingTechnicalIssueJoiSchema,
  [CertificationIssueReportCategories.TECHNICAL_PROBLEM]: categoryTechnicalProblemJoiSchema,
};

class CertificationIssueReport {
  constructor({
    id,
    certificationCourseId,
    category,
    description,
    subcategory,
    questionNumber,
    hasBeenAutomaticallyResolved,
    resolvedAt,
    resolution,
  } = {}) {
    this.id = id;
    this.certificationCourseId = certificationCourseId;
    this.category = category;
    this.subcategory = subcategory;
    this.description = description;
    this.questionNumber = questionNumber;
    this.hasBeenAutomaticallyResolved = hasBeenAutomaticallyResolved;
    this.resolvedAt = resolvedAt;
    this.resolution = resolution;
    this.isImpactful = _isImpactful({ category, subcategory });

    if (
      [
        CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN,
        CertificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE,
        CertificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE,
        CertificationIssueReportCategories.SIGNATURE_ISSUE,
      ].includes(this.category)
    ) {
      this.subcategory = null;
    }

    if (this.category === CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN) {
      this.description = null;
    }

    if (this.category !== CertificationIssueReportCategories.IN_CHALLENGE) {
      this.questionNumber = null;
    }
  }

  static create({ id, certificationCourseId, category, description, subcategory, questionNumber }) {
    const certificationIssueReport = new CertificationIssueReport({
      id,
      certificationCourseId,
      category,
      description,
      subcategory,
      questionNumber,
      hasBeenAutomaticallyResolved: null,
      resolvedAt: null,
      resolution: null,
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

    if (_isCategoryDeprecated(this.category)) {
      throw new DeprecatedCertificationIssueReportCategoryError();
    }

    if (_isSubcategoryDeprecated(this.subcategory)) {
      throw new DeprecatedCertificationIssueReportSubcategoryError();
    }
  }

  isResolved() {
    return Boolean(this.resolvedAt);
  }

  resolveManually(resolution) {
    this.resolvedAt = new Date();
    this.resolution = resolution;
    this.hasBeenAutomaticallyResolved = false;
  }

  resolveAutomatically(resolution) {
    this.resolvedAt = new Date();
    this.resolution = resolution;
    this.hasBeenAutomaticallyResolved = true;
  }
}

module.exports = CertificationIssueReport;

function _isImpactful({ category, subcategory }) {
  return ImpactfulCategories.includes(category) || ImpactfulSubcategories.includes(subcategory);
}

function _isCategoryDeprecated(category) {
  return DeprecatedCategories.includes(category);
}

function _isSubcategoryDeprecated(subcategory) {
  return DeprecatedSubcategories.includes(subcategory);
}
