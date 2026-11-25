import { NotFoundError } from '../../../../shared/domain/errors.js';
import { type SessionAuthorization } from '../models/SessionAuthorization.js';
import { type CertificationResultForCsv } from '../read-models/CertificationResultForCsv.ts';
import { type SessionForResultsSharing } from '../read-models/SessionForResultsSharing.js';

type SessionAuthorizationAdapter = {
  find: (params: { sessionId: number }) => Promise<SessionAuthorization | null>;
};

type CertificationResultForCsvRepository = {
  findBySession: (params: { sessionId: number }) => Promise<CertificationResultForCsv[]>;
};

type SessionForResultsSharingRepository = {
  get: (sessionId: number) => Promise<SessionForResultsSharing | null>;
};

export async function getSessionResults({
  sessionId,
  sessionAuthorizationAdapter,
  certificationResultForCsvRepository,
  sessionForResultsSharingRepository,
}: {
  sessionId: number;
  sessionAuthorizationAdapter: SessionAuthorizationAdapter;
  certificationResultForCsvRepository: CertificationResultForCsvRepository;
  sessionForResultsSharingRepository: SessionForResultsSharingRepository;
}): Promise<{
  certificationResults: CertificationResultForCsv[];
  sessionInfo: SessionForResultsSharing | null;
}> {
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
