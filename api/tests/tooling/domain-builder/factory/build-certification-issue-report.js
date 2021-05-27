const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

const buildCertificationIssueReport = function({
  id = 123,
  certificationCourseId,
  category = CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
  subcategory = CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
  description = 'Une super description',
  questionNumber = null,
  resolvedAt = null,
  resolution = null,
} = {}) {
  return new CertificationIssueReport({
    id,
    certificationCourseId,
    category,
    subcategory,
    description,
    questionNumber,
    resolvedAt,
    resolution,
  });
};

buildCertificationIssueReport.impactful = function({
  id,
  certificationCourseId,
  description,
  questionNumber,
  resolvedAt,
  resolution,
} = {}) {
  return buildCertificationIssueReport({
    id,
    certificationCourseId,
    description,
    questionNumber,
    resolvedAt,
    resolution,
    category: CertificationIssueReportCategories.FRAUD,
    subcategory: null,
  });
};

buildCertificationIssueReport.notImpactful = function({
  id,
  certificationCourseId,
  description,
  questionNumber,
  resolvedAt,
  resolution,
} = {}) {
  return buildCertificationIssueReport({
    id,
    certificationCourseId,
    description,
    questionNumber,
    resolvedAt,
    resolution,
    category: CertificationIssueReportCategories.CONNECTION_OR_END_SCREEN,
    subcategory: null,
  });
};

module.exports = buildCertificationIssueReport;
