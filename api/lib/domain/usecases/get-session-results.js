const moment = require('moment');

module.exports = async function getSessionResults({
  sessionId,
  sessionRepository,
  certificationResultRepository,
}) {
  const session = await sessionRepository.get(sessionId);
  const certificationResults = await certificationResultRepository.findBySessionId({ sessionId });

  const dateWithTime = moment(session.date + ' ' + session.time, 'YYYY-MM-DD HH:mm');
  const fileName = `${dateWithTime.format('YYYYMMDD_HHmm')}_resultats_session_${sessionId}.csv`;

  return { session, certificationResults, fileName };
};
