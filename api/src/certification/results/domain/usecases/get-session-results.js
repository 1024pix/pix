import { NotFoundError } from '../../../../shared/domain/errors.js';

export async function getSessionResults({
  sessionId,
  sessionAuthorizationAdapter,
  certificationResultForCsvRepository,
  sessionForResultsSharingRepository,
}) {
  const sessionAuthorization = await sessionAuthorizationAdapter.find({ sessionId });
  if (!sessionAuthorization || !sessionAuthorization.canRetrieveResults) {
    throw new NotFoundError();
  }

  const certificationResults = await certificationResultForCsvRepository.findBySession({
    sessionId,
  });

  if (certificationResults.length === 0) {
    throw new NotFoundError();
  }
  const sessionInfo = await sessionForResultsSharingRepository.get(sessionId);

  return { certificationResults, sessionInfo };
}
