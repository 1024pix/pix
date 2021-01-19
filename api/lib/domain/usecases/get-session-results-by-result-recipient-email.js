const bluebird = require('bluebird');
const moment = require('moment');

module.exports = async function getSessionResultsByResultRecipientEmail({
  sessionId,
  sessionRepository,
  certificationCourseRepository,
  certificationService,
  resultRecipientEmail,
}) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);
  const candidatesFilteredByRecipientEmail = session.certificationCandidates.filter((certificationCandidate)=> certificationCandidate.resultRecipientEmail === resultRecipientEmail);
  const userIds = candidatesFilteredByRecipientEmail.map((candidate) => candidate.userId);

  const certificationCourses = await certificationCourseRepository.findBySessionIdAndUserIds({ sessionId, userIds });

  const certificationResults = await bluebird.mapSeries(certificationCourses,
    (certificationCourse) => certificationService.getCertificationResultByCertifCourse({ certificationCourse }),
  );

  const dateWithTime = moment(session.date + ' ' + session.time, 'YYYY-MM-DD HH:mm');
  const fileName = `${dateWithTime.format('YYYYMMDD_HHmm')}_resultats_session_${sessionId}.csv`;

  return { session, certificationResults, fileName };
};
