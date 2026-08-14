/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').EventAdapter} EventAdapter
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError, NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {EventAdapter} params.eventAdapter
 * @throws {NotFoundError} the session does not exist or its access is restricted
 */
export async function importCertificationCandidatesFromCandidatesImportSheet({
  sessionId,
  odsBuffer,
  i18n,
  candidateRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  centerRepository,
  sessionRepository,
  eventAdapter,
  sessionAuthorizationAdapter,
  certificationCandidatesOdsService,
  certificationCpfService,
}) {
  const sessionAuthorization = await sessionAuthorizationAdapter.find({ sessionId });

  if (!sessionAuthorization) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  if (!sessionAuthorization.canEnrollCandidateViaODS) {
    throw new CandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const session = await sessionRepository.get({ id: sessionId });

  const candidates = await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
    i18n,
    session,
    isSco: session.isSco,
    odsBuffer,
    certificationCpfService,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
    centerRepository,
  });

  const savedCandidates = await DomainTransaction.execute(async () => {
    await candidateRepository.deleteBySessionId({ sessionId });
    return candidateRepository.save({ candidates });
  });
  await eventAdapter.onCandidatesEnrolledWithImportSheet({ candidates: savedCandidates });
}
