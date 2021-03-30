const { NotFoundError } = require('../../domain/errors');
const CertificationIssueReportBookshelf = require('../data/certification-issue-report');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const omit = require('lodash/omit');

module.exports = {
  async save(certificationIssueReport) {
    const newCertificationIssueReport = await new CertificationIssueReportBookshelf(
      omit(certificationIssueReport, ['isActionRequired']),
    ).save();
    return bookshelfToDomainConverter.buildDomainObject(CertificationIssueReportBookshelf, newCertificationIssueReport);
  },

  async get(id) {
    try {
      const certificationIssueReport = await CertificationIssueReportBookshelf
        .where({ id })
        .fetch();
      return bookshelfToDomainConverter.buildDomainObject(CertificationIssueReportBookshelf, certificationIssueReport);
    } catch (err) {
      if (err instanceof CertificationIssueReportBookshelf.NotFoundError) {
        throw new NotFoundError('Le signalement n\'existe pas');
      }
      throw err;
    }
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
