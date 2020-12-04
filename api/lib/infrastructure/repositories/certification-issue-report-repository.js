
const CertificationIssueReportBookshelf = require('../data/certification-issue-report');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {
  async save(certificationIssueReport) {
    const newCertificationIssueReport = await new CertificationIssueReportBookshelf(certificationIssueReport).save();
    return bookshelfToDomainConverter.buildDomainObject(CertificationIssueReportBookshelf, newCertificationIssueReport);
  },
};
