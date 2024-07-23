import _ from 'lodash';

const getSessionResultsByResultRecipientEmail = async function ({
  sessionId,
  resultRecipientEmail,
  sharedSessionRepository,
  certificationResultRepository,
}) {
  const session = await sharedSessionRepository.getWithCertificationCandidates({ id: sessionId });
  const certificationCandidateIdsForResultRecipient = _(session.certificationCandidates)
    .filter({ resultRecipientEmail })
    .map('id')
    .value();

  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: certificationCandidateIdsForResultRecipient,
  });

  return { session, certificationResults };
};

export { getSessionResultsByResultRecipientEmail };
