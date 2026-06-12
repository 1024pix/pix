/**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').EventApi} EventApi
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';
import { EVENT_NAMES } from '../../../shared/domain/constants/event-names.js';

/**
 * @param {object} params
 * @param {CandidateRepository} params.candidateRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {EventApi} params.eventApi
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
  eventApi,
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
  const dtoEvents = savedCandidates.map((savedCandidate) => ({
    name: EVENT_NAMES.CANDIDATE_ENROLLED,
    candidateId: savedCandidate.id,
    createdAt: savedCandidate.createdAt,
    metadata: savedCandidate.toDTO(),
  }));
  await eventApi.pushEvents(dtoEvents);
}
