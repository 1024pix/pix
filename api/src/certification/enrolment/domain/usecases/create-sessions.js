/**
 * @typedef {import ("./index.js").dependencies} deps
 */

import bluebird from 'bluebird';

import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationCandidate } from '../../../../../lib/domain/models/index.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationVersion } from '../../../shared/domain/models/CertificationVersion.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';

/**
 * @param {Object} params
 * @param {deps["certificationCandidateRepository"]} params.certificationCandidateRepository
 * @param {deps["certificationCenterRepository"]} params.certificationCenterRepository
 * @param {deps["sessionRepository"]} params.sessionRepository
 * @param {deps["temporarySessionsStorageForMassImportService"]} params.temporarySessionsStorageForMassImportService
 */
const createSessions = async function ({
  userId,
  cachedValidatedSessionsKey,
  certificationCenterId,
  certificationCandidateRepository,
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

  await DomainTransaction.execute(async (domainTransaction) => {
    return await bluebird.mapSeries(temporaryCachedSessions, async (sessionDTO) => {
      let { id: sessionId } = sessionDTO;
      const { certificationCandidates } = sessionDTO;

      if (sessionId) {
        await _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction });
      } else {
        const { id } = await _saveNewSessionReturningId({
          sessionRepository,
          sessionDTO: { ...sessionDTO, createdBy: userId },
          domainTransaction,
          isV3Pilot,
        });
        sessionId = id;
      }

      if (_hasCandidates(certificationCandidates)) {
        await _saveCertificationCandidates({
          certificationCandidates,
          sessionId,
          certificationCandidateRepository,
          domainTransaction,
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

function _hasCandidates(certificationCandidates) {
  return certificationCandidates.length > 0;
}

async function _saveNewSessionReturningId({ sessionRepository, sessionDTO, domainTransaction, isV3Pilot }) {
  const sessionToSave = new SessionEnrolment({
    ...sessionDTO,
    version: isV3Pilot ? CertificationVersion.V3 : CertificationVersion.V2,
  });
  return await sessionRepository.save({ session: sessionToSave, domainTransaction });
}

async function _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction }) {
  await certificationCandidateRepository.deleteBySessionId({ sessionId, domainTransaction });
}

async function _saveCertificationCandidates({
  certificationCandidates,
  sessionId,
  certificationCandidateRepository,
  domainTransaction,
}) {
  await bluebird.mapSeries(certificationCandidates, async (certificationCandidateDTO) => {
    const certificationCandidate = new CertificationCandidate({ ...certificationCandidateDTO });
    await certificationCandidateRepository.saveInSession({
      sessionId,
      certificationCandidate,
      domainTransaction,
    });
  });
}
