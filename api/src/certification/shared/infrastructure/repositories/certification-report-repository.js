import _ from 'lodash';
import bluebird from 'bluebird';

import { Bookshelf } from '../../../../../lib/infrastructure/bookshelf.js';
import { CertificationReport } from '../../domain/models/CertificationReport.js';
import { BookshelfCertificationCourse } from '../../../../../lib/infrastructure/orm-models/CertificationCourse.js';
import { CertificationCourseUpdateError } from '../../domain/errors.js';
import { toDomain } from './certification-course-repository.js';

const findBySessionId = async function (sessionId) {
  const results = await BookshelfCertificationCourse.where({ sessionId })
    .query((qb) => {
      qb.orderByRaw('LOWER("lastName") asc');
      qb.orderByRaw('LOWER("firstName") asc');
    })
    .fetchAll({
      withRelated: ['certificationIssueReports', 'assessment'],
    });

  const certificationCourses = results.map(toDomain);
  return _.map(certificationCourses, CertificationReport.fromCertificationCourse);
};

const finalizeAll = async function (certificationReports) {
  try {
    await Bookshelf.transaction((trx) => {
      const finalizeReport = (certificationReport) => _finalize({ certificationReport, transaction: trx });
      return bluebird.mapSeries(certificationReports, finalizeReport);
    });
  } catch (err) {
    throw new CertificationCourseUpdateError('An error occurred while finalizing the session');
  }
};

export { findBySessionId, finalizeAll };

async function _finalize({ certificationReport, transaction = undefined }) {
  const saveOptions = { patch: true, method: 'update' };
  if (transaction) {
    saveOptions.transacting = transaction;
  }

  await new BookshelfCertificationCourse({ id: certificationReport.certificationCourseId }).save(
    { hasSeenEndTestScreen: certificationReport.hasSeenEndTestScreen },
    saveOptions,
  );
}
