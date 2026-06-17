/**
 * @typedef {import ("./index.js").dependencies} deps
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Candidate } from '../models/Candidate.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';

/**
 * @param {object} params
 * @param {deps["candidateRepository"]} params.candidateRepository
 * @param {deps["sessionRepository"]} params.sessionRepository
 * @param {deps["eventAdapter"]} params.eventAdapter
 * @param {deps["temporarySessionsStorageForMassImportService"]} params.temporarySessionsStorageForMassImportService
 */
export async function createSessions({
  userId,
  cachedValidatedSessionsKey,
  candidateRepository,
  sessionRepository,
  eventAdapter,
  temporarySessionsStorageForMassImportService,
}) {
  const temporaryCachedSessions = await temporarySessionsStorageForMassImportService.getByKeyAndUserId({
    cachedValidatedSessionsKey,
    userId,
  });

  if (!temporaryCachedSessions) {
    throw new NotFoundError();
  }

  await DomainTransaction.execute(async () => {
    for (const sessionDTO of temporaryCachedSessions) {
      let { id: sessionId } = sessionDTO;
      const candidates = sessionDTO.certificationCandidates;

      if (sessionId) {
        await _deleteExistingCandidatesInSession({ candidateRepository, sessionId });
      } else {
        const { id } = await _saveNewSessionReturningId({
          sessionRepository,
          sessionDTO: { ...sessionDTO, createdBy: userId },
        });
        sessionId = id;
      }

      if (candidates.length > 0) {
        const savedCandidates = await _saveCandidates({
          candidates,
          sessionId,
          candidateRepository,
        });
        await eventAdapter.onCandidatesEnrolledWithMassSessionsImport({ candidates: savedCandidates });
      }
    }
  });

  await temporarySessionsStorageForMassImportService.remove({
    cachedValidatedSessionsKey,
    userId,
  });
}

async function _saveNewSessionReturningId({ sessionRepository, sessionDTO }) {
  const sessionToSave = new SessionEnrolment(sessionDTO);
  return await sessionRepository.save({ session: sessionToSave });
}

async function _deleteExistingCandidatesInSession({ candidateRepository, sessionId }) {
  await candidateRepository.deleteBySessionId({ sessionId });
}

async function _saveCandidates({ candidates, sessionId, candidateRepository }) {
  const candidatesToSave = candidates.map((candidate) => {
    return new Candidate({ ...candidate, sessionId });
  });
  return candidateRepository.save({ candidates: candidatesToSave });
}
