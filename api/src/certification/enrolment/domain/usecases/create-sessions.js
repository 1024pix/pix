/**
 * @typedef {import ("./index.js").dependencies} deps
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Candidate } from '../models/Candidate.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';

/**
 * @param {Object} params
 * @param {deps["candidateRepository"]} params.candidateRepository
 * @param {deps["sessionRepository"]} params.sessionRepository
 * @param {deps["temporarySessionsStorageForMassImportService"]} params.temporarySessionsStorageForMassImportService
 */
const createSessions = async function ({
  userId,
  cachedValidatedSessionsKey,
  candidateRepository,
  sessionRepository,
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

      if (_hasCandidates(candidates)) {
        await _saveCandidates({
          candidates,
          sessionId,
          candidateRepository,
        });
      }
    }
  });

  await temporarySessionsStorageForMassImportService.remove({
    cachedValidatedSessionsKey,
    userId,
  });
};

export { createSessions };

function _hasCandidates(candidates) {
  return candidates.length > 0;
}

async function _saveNewSessionReturningId({ sessionRepository, sessionDTO }) {
  const sessionToSave = new SessionEnrolment(sessionDTO);
  return await sessionRepository.save({ session: sessionToSave });
}

async function _deleteExistingCandidatesInSession({ candidateRepository, sessionId }) {
  await candidateRepository.deleteBySessionId({ sessionId });
}

async function _saveCandidates({ candidates, sessionId, candidateRepository }) {
  for (const candidateDTO of candidates) {
    const candidate = new Candidate({ ...candidateDTO });
    await candidateRepository.saveInSession({
      sessionId,
      candidate,
    });
  }
}
