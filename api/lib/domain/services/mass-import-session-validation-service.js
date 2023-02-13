const bluebird = require('bluebird');
const sessionValidator = require('../validators/session-validator');
const certificationCpfService = require('./certification-cpf-service');
const sessionCodeService = require('./session-code-service');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository');
const certificationCpfCountryRepository = require('../../infrastructure/repositories/certification-cpf-country-repository');
const certificationCpfCityRepository = require('../../infrastructure/repositories/certification-cpf-city-repository');
const CertificationCandidate = require('../models/CertificationCandidate');
const { MassImportSessionErrorManager } = require('./Mass-import-session-error-manager');
const Session = require('../models/Session');

module.exports = {
  async checkMassImportSessions({ sessions, certificationCenterId, certificationCenter, isSco }) {
    const massImportSessionErrorManager = new MassImportSessionErrorManager();
    const sessionsToSave = [];

    await bluebird.mapSeries(sessions, async (session) => {
      const { sessionId } = session;
      const { date, time, line } = session;
      const sessionDate = new Date(`${date}T${time}`);
      let domainSession;

      if (_isSessionScheduledInThePast(sessionDate)) {
        massImportSessionErrorManager.addBlockingError({
          line,
          error: 'Une session ne peut pas être programmée dans le passé',
        });
      }

      if (sessionId) {
        if (_hasSessionInfo(session)) {
          massImportSessionErrorManager.addBlockingError({
            line,
            error: `Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`,
          });
        }

        domainSession = new Session({
          ...session,
          certificationCenterId,
          certificationCenter,
        });
      }

      if (!sessionId && _hasSessionInfo(session)) {
        const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
        if (isSessionExisting) {
          massImportSessionErrorManager.addBlockingError({
            line,
            error: `La session prévue le ${date} à ${time} existe déjà.`,
          });
        }

        const { newSession, report } = _createAndValidateNewSessionToSave(
          session,
          certificationCenterId,
          certificationCenter
        );

        if (report?.length) {
          report.forEach((error) => massImportSessionErrorManager.addBlockingError({ line, error }));
        }

        domainSession = newSession;
        sessionsToSave.push(domainSession);
      }

      if (domainSession.certificationCandidates.length) {
        const { certificationCandidates } = domainSession;
        const { line } = certificationCandidates;

        if (_hasDuplicateCertificationCandidates(certificationCandidates)) {
          massImportSessionErrorManager.addBlockingError({ line, error: 'La session contient un élève en double.' });
        }

        await _validateCertificationCandidates({
          certificationCandidates,
          line,
          massImportSessionErrorManager,
          sessionId,
          isSco,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });
      }
    });
    return {
      massImportSessionErrorManager,
      sessionsToSave,
    };
  },
};

function _isSessionScheduledInThePast(sessionDate) {
  return sessionDate < new Date();
}

function _hasSessionInfo(session) {
  return session.address || session.room || session.date || session.time || session.examiner;
}

function _createAndValidateNewSessionToSave(session, certificationCenterId, certificationCenter) {
  const accessCode = sessionCodeService.getNewSessionCode();
  const newSession = new Session({
    ...session,
    certificationCenterId,
    certificationCenter,
    accessCode,
  });

  newSession.generateSupervisorPassword();
  const report = sessionValidator.validateForMassSessionImport(newSession);
  return { newSession, report };
}

function _hasDuplicateCertificationCandidates(certificationCandidates) {
  const uniqCertificationCandidates = new Set(
    certificationCandidates.map(({ lastName, firstName, birthdate }) => `${lastName}${firstName}${birthdate}`)
  );

  return uniqCertificationCandidates.size < certificationCandidates.length;
}

async function _validateCertificationCandidates({
  certificationCandidates,
  line,
  massImportSessionErrorManager,
  sessionId,
  isSco,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  await bluebird.mapSeries(certificationCandidates, async (certificationCandidate) => {
    const billingMode = CertificationCandidate.translateBillingMode(certificationCandidate.billingMode);

    const domainCertificationCandidate = new CertificationCandidate({
      ...certificationCandidate,
      sessionId,
      billingMode,
    });

    const report = domainCertificationCandidate.validateForMassSessionImport(isSco);

    if (report?.length) {
      report.forEach((error) => massImportSessionErrorManager.addBlockingError({ line, error }));
    }

    const cpfBirthInformation = await certificationCpfService.getBirthInformation({
      birthCountry: domainCertificationCandidate.birthCountry,
      birthCity: domainCertificationCandidate.birthCity,
      birthPostalCode: domainCertificationCandidate.birthPostalCode,
      birthINSEECode: domainCertificationCandidate.birthINSEECode,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    if (cpfBirthInformation.hasFailed()) {
      massImportSessionErrorManager.addBlockingError({ line, error: cpfBirthInformation.message });
    }

    domainCertificationCandidate.updateBirthInformation(cpfBirthInformation);
  });
}
