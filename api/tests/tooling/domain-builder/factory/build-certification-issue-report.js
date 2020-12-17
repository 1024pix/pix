const CertificationIssueReport = require('../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

module.exports = function buildCertificationIssueReport({
  id = 123,
  certificationCourseId,
  category = CertificationIssueReportCategories.OTHER,
  description = 'Une super description',
} = {}) {
  return new CertificationIssueReport({
    id,
    certificationCourseId,
    category,
    description,
  });
};
