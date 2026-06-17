/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').EventAdapter} EventAdapter
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {EventAdapter} params.eventAdapter
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
  certificationCandidatesOdsService,
  certificationCpfService,
}) {
  const candidatesInSession = await candidateRepository.findBySessionId({ sessionId });
  const session = await sessionRepository.get({ id: sessionId });

  if (session.hasReconciledCandidate({ candidates: candidatesInSession })) {
    throw new CandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

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
