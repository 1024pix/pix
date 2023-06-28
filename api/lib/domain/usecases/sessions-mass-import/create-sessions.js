import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import bluebird from 'bluebird';
import { DomainTransaction } from '../../../infrastructure/DomainTransaction.js';
import { Session } from '../../../../src/certification/session/domain/models/Session.js';
import { CertificationCandidate } from '../../../../src/certification/candidate/domain/models/CertificationCandidate.js';

const createSessions = async function ({
  userId,
  cachedValidatedSessionsKey,
  certificationCandidateRepository,
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

  await DomainTransaction.execute(async (domainTransaction) => {
    return await bluebird.mapSeries(temporaryCachedSessions, async (sessionDTO) => {
      let { id: sessionId } = sessionDTO;
      const { certificationCandidates } = sessionDTO;

      if (sessionId) {
        await _deleteExistingCandidatesInSession({ certificationCandidateRepository, sessionId, domainTransaction });
      } else {
        const { id } = await _saveNewSessionReturningId({
          sessionRepository,
          sessionDTO,
          domainTransaction,
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

async function _saveNewSessionReturningId({ sessionRepository, sessionDTO, domainTransaction }) {
  const sessionToSave = new Session({ ...sessionDTO });
  return await sessionRepository.save(sessionToSave, domainTransaction);
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
