import _ from 'lodash';

import { CertificationReport } from '../../../lib/domain/models/CertificationReport.js';
import { buildCertificationCourse } from './build-certification-course.js';

const buildCertificationReport = function ({
  firstName = 'Bobby',
  lastName = 'Lapointe',
  isCompleted = true,
  hasSeenEndTestScreen = false,
  certificationCourseId,
  sessionId,
  abortReason = null,
} = {}) {
  certificationCourseId = _.isUndefined(certificationCourseId)
    ? buildCertificationCourse({ firstName, lastName, sessionId, hasSeenEndTestScreen }).id
    : certificationCourseId;

  const id = CertificationReport.idFromCertificationCourseId(certificationCourseId);

  const values = {
    id,
    firstName,
    lastName,
    isCompleted,
    hasSeenEndTestScreen,
    certificationCourseId,
    abortReason,
  };
  return values;
};

export { buildCertificationReport };
