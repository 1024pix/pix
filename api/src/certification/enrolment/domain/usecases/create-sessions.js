/**
 * @typedef {import ("./index.js").dependencies} deps
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SESSIONS_VERSIONS } from '../../../shared/domain/models/SessionVersion.js';
import { Candidate } from '../models/Candidate.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';

/**
 * @param {Object} params
 * @param {deps["candidateRepository"]} params.candidateRepository
 * @param {deps["sessionRepository"]} params.sessionRepository
 * @param {deps["centerRepository"]} params.centerRepository
 * @param {deps["temporarySessionsStorageForMassImportService"]} params.temporarySessionsStorageForMassImportService
 */
const createSessions = async function ({
  userId,
  cachedValidatedSessionsKey,
  certificationCenterId,
  candidateRepository,
  sessionRepository,
  centerRepository,
  temporarySessionsStorageForMassImportService,
}) {
  const temporaryCachedSessions = await temporarySessionsStorageForMassImportService.getByKeyAndUserId({
    cachedValidatedSessionsKey,
    userId,
  });

  if (!temporaryCachedSessions) {
    throw new NotFoundError();
  }

  const { isV3Pilot } = await centerRepository.getById({ id: certificationCenterId });

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
          isV3Pilot,
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

async function _saveNewSessionReturningId({ sessionRepository, sessionDTO, isV3Pilot }) {
  const sessionToSave = new SessionEnrolment({
    ...sessionDTO,
    version: isV3Pilot ? SESSIONS_VERSIONS.V3 : SESSIONS_VERSIONS.V2,
  });
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
