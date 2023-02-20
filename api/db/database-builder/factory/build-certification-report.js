import buildCertificationCourse from './build-certification-course';
import CertificationReport from '../../../lib/domain/models/CertificationReport';
import _ from 'lodash';

export default function buildCertificationReport({
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
}
