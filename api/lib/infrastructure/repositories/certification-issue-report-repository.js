const CertificationIssueReportBookshelf = require('../data/certification-issue-report');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {
  async save(certificationIssueReport) {
    const newCertificationIssueReport = await new CertificationIssueReportBookshelf(certificationIssueReport).save();
    return bookshelfToDomainConverter.buildDomainObject(CertificationIssueReportBookshelf, newCertificationIssueReport);
  },

  async delete(id) {
    try {
      await CertificationIssueReportBookshelf
        .where({ id })
        .destroy({ require: true });
      return true;
    } catch (err) {
      if (err instanceof CertificationIssueReportBookshelf.NoRowsDeletedError) {
        return false;
      }
    }
  },
};
