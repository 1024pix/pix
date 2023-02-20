import { NotFoundError } from '../../domain/errors';

export default async function flagSessionResultsAsSentToPrescriber({ sessionId, sessionRepository }) {
  const integerSessionId = parseInt(sessionId);
  const NOT_FOUND_SESSION = `La session ${sessionId} n'existe pas ou son accès est restreint lors du marquage d'envoi des résultats au prescripteur`;

  if (!Number.isFinite(integerSessionId)) {
    throw new NotFoundError(NOT_FOUND_SESSION);
  }

  let session = await sessionRepository.get(sessionId);

  if (!session.areResultsFlaggedAsSent()) {
    session = await sessionRepository.flagResultsAsSentToPrescriber({
      id: sessionId,
      resultsSentToPrescriberAt: new Date(),
    });
    return { resultsFlaggedAsSent: true, session };
  }

  return { resultsFlaggedAsSent: false, session };
}
