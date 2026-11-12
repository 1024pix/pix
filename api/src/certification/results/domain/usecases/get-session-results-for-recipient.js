import { NotFoundError } from '../../../../shared/domain/errors.js';

export async function getSessionResultsForRecipient({
  sessionId,
  resultRecipientEmail,
  dependencies: {
    sessionAuthorizationAdapter,
    certificationResultForCsvRepository,
    sessionForResultsSharingRepository,
  },
}) {
  const sessionAuthorization = await sessionAuthorizationAdapter.find({ sessionId });
  if (!sessionAuthorization || !sessionAuthorization.canResultRecipientDownloadResult()) {
    throw new NotFoundError();
  }

  const certificationResults = await certificationResultForCsvRepository.findBySessionAndResultRecipient({
    sessionId,
    resultRecipientEmail,
  });

  if (certificationResults.length === 0) {
    throw new NotFoundError();
  }
  const sessionInfo = await sessionForResultsSharingRepository.get(sessionId);

  return { certificationResults, sessionInfo };
}
