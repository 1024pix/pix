const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

module.exports = function buildCertificationIssueReport({
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
