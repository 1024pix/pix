const _ = require('lodash');

const Bookshelf = require('../bookshelf');
const { CertificationReport } = require('../../domain/models/CertificationReport');

const CertificationCourseBookshelf = require('../data/certification-course');
const bookshelfToDomainConverter = require('../../infrastructure/utils/bookshelf-to-domain-converter');
const { CertificationCourseUpdateError } = require('../../domain/errors');

module.exports = {

  findBySessionId(sessionId) {
    return CertificationCourseBookshelf
      .where({ sessionId })
      .query((qb) => {
        qb.orderByRaw('LOWER("lastName") asc');
        qb.orderByRaw('LOWER("firstName") asc');
      })
      .fetchAll()
      .then((results) => {
        const certificationCourses = bookshelfToDomainConverter.buildDomainObjects(CertificationCourseBookshelf, results);

        return _.map(certificationCourses, CertificationReport.fromCertificationCourse);
      });
  },

  async finalize({ certificationReport, transaction = undefined }) {
    const saveOptions = { patch: true, method: 'update' };
    if (transaction) {
      saveOptions.transacting = transaction;
    }

    const reportDataToUpdate = _.pick(certificationReport, [
      'hasSeenEndTestScreen',
      'examinerComment',
    ]);
    await new CertificationCourseBookshelf({ id: certificationReport.certificationCourseId })
      .save(reportDataToUpdate, saveOptions);
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
