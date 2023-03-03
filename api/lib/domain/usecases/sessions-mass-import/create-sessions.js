const { NotFoundError } = require('../../errors');
const bluebird = require('bluebird');
const DomainTransaction = require('../../../infrastructure/DomainTransaction.js');
const temporarySessionsStorageForMassImportService = require('../../services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');
const Session = require('../../models/Session');
const CertificationCandidate = require('../../models/CertificationCandidate');

module.exports = async function createSessions({
  userId,
  cachedValidatedSessionsKey,
  certificationCandidateRepository,
  sessionRepository,
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

  await temporarySessionsStorageForMassImportService.delete({
    cachedValidatedSessionsKey,
    userId,
  });
};

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
