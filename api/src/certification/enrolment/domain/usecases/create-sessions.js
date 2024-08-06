/**
 * @typedef {import ("./index.js").dependencies} deps
 */

import bluebird from 'bluebird';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CERTIFICATION_VERSIONS } from '../../../shared/domain/models/CertificationVersion.js';
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
  certificationCenterId,
  candidateRepository,
  sessionRepository,
  certificationCenterRepository,
  temporarySessionsStorageForMassImportService,
}) {
  const temporaryCachedSessions = await temporarySessionsStorageForMassImportService.getByKeyAndUserId({
    cachedValidatedSessionsKey,
    userId,
  });

  if (!temporaryCachedSessions) {
    throw new NotFoundError();
  }

  const { isV3Pilot } = await certificationCenterRepository.get({ id: certificationCenterId });

  await DomainTransaction.execute(async () => {
    return await bluebird.mapSeries(temporaryCachedSessions, async (sessionDTO) => {
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
    });
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
    version: isV3Pilot ? CERTIFICATION_VERSIONS.V3 : CERTIFICATION_VERSIONS.V2,
  });
  return await sessionRepository.save({ session: sessionToSave });
}

async function _deleteExistingCandidatesInSession({ candidateRepository, sessionId }) {
  await candidateRepository.deleteBySessionId({ sessionId });
}

async function _saveCandidates({ candidates, sessionId, candidateRepository }) {
  await bluebird.mapSeries(candidates, async (candidateDTO) => {
    const candidate = new Candidate({ ...candidateDTO });
    await candidateRepository.saveInSession({
      sessionId,
      candidate,
    });
  });
}
