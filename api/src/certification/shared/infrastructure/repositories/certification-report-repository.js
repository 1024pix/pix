import bluebird from 'bluebird';
import _ from 'lodash';

import { Bookshelf } from '../../../../shared/infrastructure/bookshelf.js';
import { BookshelfAssessment } from '../../../../shared/infrastructure/orm-models/Assessment.js';
import { BookshelfCertificationCourse } from '../../../../shared/infrastructure/orm-models/CertificationCourse.js';
import * as bookshelfToDomainConverter from '../../../../shared/infrastructure/utils/bookshelf-to-domain-converter.js';
import { ComplementaryCertificationCourse } from '../../../session-management/domain/models/ComplementaryCertificationCourse.js';
import { CertificationCourseUpdateError } from '../../domain/errors.js';
import { CertificationCourse } from '../../domain/models/CertificationCourse.js';
import { CertificationIssueReport } from '../../domain/models/CertificationIssueReport.js';
import { CertificationReport } from '../../domain/models/CertificationReport.js';

const findBySessionId = async function ({ sessionId }) {
  const results = await BookshelfCertificationCourse.where({ sessionId })
    .query((qb) => {
      qb.orderByRaw('LOWER("lastName") asc');
      qb.orderByRaw('LOWER("firstName") asc');
    })
    .fetchAll({
      withRelated: ['certificationIssueReports', 'assessment'],
    });

  const certificationCourses = results.map(bookshelfToDomain);
  return _.map(certificationCourses, CertificationReport.fromCertificationCourse);
};

const finalizeAll = async function ({ certificationReports }) {
  try {
    await Bookshelf.transaction((trx) => {
      const finalizeReport = (certificationReport) => _finalize({ certificationReport, transaction: trx });
      return bluebird.mapSeries(certificationReports, finalizeReport);
    });
  } catch (err) {
    throw new CertificationCourseUpdateError('An error occurred while finalizing the session');
  }
};

export { finalizeAll, findBySessionId };

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

function bookshelfToDomain(bookshelfCertificationCourse) {
  if (!bookshelfCertificationCourse) {
    return null;
  }

  const assessment = bookshelfToDomainConverter.buildDomainObject(
    BookshelfAssessment,
    bookshelfCertificationCourse.related('assessment'),
  );
  const dbCertificationCourse = bookshelfCertificationCourse.toJSON();
  return new CertificationCourse({
    assessment,
    challenges: bookshelfCertificationCourse.related('challenges').toJSON(),
    certificationIssueReports: bookshelfCertificationCourse
      .related('certificationIssueReports')
      .toJSON()
      .map((json) => new CertificationIssueReport(json)),
    complementaryCertificationCourses: bookshelfCertificationCourse
      .related('complementaryCertificationCourses')
      .toJSON()
      .map((json) => new ComplementaryCertificationCourse(json)),
    ..._.pick(dbCertificationCourse, [
      'id',
      'userId',
      'createdAt',
      'completedAt',
      'firstName',
      'lastName',
      'birthplace',
      'birthdate',
      'sex',
      'birthPostalCode',
      'birthINSEECode',
      'birthCountry',
      'sessionId',
      'externalId',
      'isPublished',
      'hasSeenEndTestScreen',
      'isCancelled',
      'isRejectedForFraud',
      'maxReachableLevelOnCertificationDate',
      'verificationCode',
      'abortReason',
      'version',
    ]),
  });
}
