const _ = require('lodash');

const Bookshelf = require('../bookshelf');
const CertificationReport = require('../../domain/models/CertificationReport');
const { CertificationIssueReportCategories } = require('../../domain/models/CertificationIssueReportCategory');

const CertificationCourseBookshelf = require('../data/certification-course');
const CertificationIssueReportBookshelf = require('../data/certification-issue-report');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const { CertificationCourseUpdateError } = require('../../domain/errors');

module.exports = {

  async findBySessionId(sessionId) {
    const results = await CertificationCourseBookshelf
      .where({ sessionId })
      .query((qb) => {
        qb.orderByRaw('LOWER("lastName") asc');
        qb.orderByRaw('LOWER("firstName") asc');
      })
      .fetchAll({
        withRelated: [ 'certificationIssueReports' ],
      });

    const certificationCourses = bookshelfToDomainConverter.buildDomainObjects(CertificationCourseBookshelf, results);
    return _.map(certificationCourses, CertificationReport.fromCertificationCourse);
  },

  async finalize({ certificationReport, transaction = undefined }) {
    const saveOptions = { patch: true, method: 'update' };
    if (transaction) {
      saveOptions.transacting = transaction;
    }

    await new CertificationCourseBookshelf({ id: certificationReport.certificationCourseId })
      .save({ hasSeenEndTestScreen :certificationReport.hasSeenEndTestScreen }, saveOptions);

    if (certificationReport.examinerComment) {
      await new CertificationIssueReportBookshelf({
        certificationCourseId: certificationReport.certificationCourseId,
        description: certificationReport.examinerComment,
        categoryId: CertificationIssueReportCategories.OTHER,
      })
        .save();
    }
  },

  async finalizeAll(certificationReports) {
    try {
      await Bookshelf.transaction((trx) => {
        return Promise.all(certificationReports.map((certificationReport) => {
          return this.finalize({ certificationReport, transaction: trx });
        }));
      });
    } catch (err) {
      throw new CertificationCourseUpdateError('An error occurred while finalizing the session');
    }
  },

};
