const _ = require('lodash');
const moment = require('moment');

module.exports = async function getSessionResultsByResultRecipientEmail({
  sessionId,
  resultRecipientEmail,
  sessionRepository,
  certificationResultRepository,
}) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);
  const certificationCandidateIdsForResultRecipient =
      _(session.certificationCandidates)
        .filter({ resultRecipientEmail })
        .map('id')
        .value();

  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({ certificationCandidateIds: certificationCandidateIdsForResultRecipient });

  const dateWithTime = moment(session.date + ' ' + session.time, 'YYYY-MM-DD HH:mm');
  const fileName = `${dateWithTime.format('YYYYMMDD_HHmm')}_resultats_session_${sessionId}.csv`;

  return { session, certificationResults, fileName };
};
