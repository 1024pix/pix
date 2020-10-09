const { getCertificationResultByCertifCourse } = require('../../domain/services/certification-service');
const bluebird = require('bluebird');
const moment = require('moment');

module.exports = async function getSessionResults({
  sessionId,
  sessionRepository,
  certificationCourseRepository,
}) {
  const session = await sessionRepository.get(sessionId);
  const allCertificationCoursesInSession = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId });

  const certificationResults = await bluebird.mapSeries(allCertificationCoursesInSession,
    (certificationCourse) => getCertificationResultByCertifCourse({ certificationCourse }),
  );

  const dateWithTime = moment(session.date + ' ' + session.time, 'YYYY-MM-DD HH:mm');
  const fileName = `${dateWithTime.format('YYYYMMDD_HHmm')}_resultats_session_${sessionId}.csv`;

  return { session, certificationResults, fileName };
};
