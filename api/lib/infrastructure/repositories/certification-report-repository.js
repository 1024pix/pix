const _ = require('lodash');
const bluebird = require('bluebird');

const Bookshelf = require('../bookshelf');
const CertificationReport = require('../../domain/models/CertificationReport');

const CertificationCourseBookshelf = require('../orm-models/CertificationCourse');
const { CertificationCourseUpdateError } = require('../../domain/errors');
const { toDomain } = require('./certification-course-repository');

module.exports = {
  async findBySessionId(sessionId) {
    const results = await CertificationCourseBookshelf.where({ sessionId })
      .query((qb) => {
        qb.orderByRaw('LOWER("lastName") asc');
        qb.orderByRaw('LOWER("firstName") asc');
      })
      .fetchAll({
        withRelated: ['certificationIssueReports', 'assessment'],
      });

    const certificationCourses = results.map(toDomain);
    return _.map(certificationCourses, CertificationReport.fromCertificationCourse);
  },

  async finalizeAll(certificationReports) {
    try {
      await Bookshelf.transaction((trx) => {
        const finalizeReport = (certificationReport) => _finalize({ certificationReport, transaction: trx });
        return bluebird.mapSeries(certificationReports, finalizeReport);
      });
    } catch (err) {
      throw new CertificationCourseUpdateError('An error occurred while finalizing the session');
    }
  },
};

async function _finalize({ certificationReport, transaction = undefined }) {
  const saveOptions = { patch: true, method: 'update' };
  if (transaction) {
    saveOptions.transacting = transaction;
  }

  await new CertificationCourseBookshelf({ id: certificationReport.certificationCourseId }).save(
    { hasSeenEndTestScreen: certificationReport.hasSeenEndTestScreen },
    saveOptions
  );
}
