import _ from 'lodash';

export default async function getSessionResultsByResultRecipientEmail({
  sessionId,
  resultRecipientEmail,
  sessionRepository,
  certificationResultRepository,
}) {
  const session = await sessionRepository.getWithCertificationCandidates(sessionId);
  const certificationCandidateIdsForResultRecipient = _(session.certificationCandidates)
    .filter({ resultRecipientEmail })
    .map('id')
    .value();

  const certificationResults = await certificationResultRepository.findByCertificationCandidateIds({
    certificationCandidateIds: certificationCandidateIdsForResultRecipient,
  });

  return { session, certificationResults };
}
