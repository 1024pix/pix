const Session = require('../models/Session.js');
const sessionCodeService = require('../services/session-code-service.js');
const sessionsImportValidationService = require('../services/sessions-import-validation-service.js');
const CertificationCandidate = require('../models/CertificationCandidate.js');
const bluebird = require('bluebird');

module.exports = async function createSessions({
  sessions,
  certificationCenterId,
  certificationCenterRepository,
  sessionRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  certificationCandidateRepository,
  complementaryCertificationRepository,
  certificationCourseRepository,
}) {
  const { name: certificationCenter, isSco } = await certificationCenterRepository.get(certificationCenterId);

  return await bluebird.mapSeries(sessions, async (sessionDTO) => {
    const { sessionId } = sessionDTO;

    const accessCode = sessionCodeService.getNewSessionCode();
    const session = new Session({
      ...sessionDTO,
      id: sessionId,
      certificationCenterId,
      certificationCenter,
      accessCode,
    });

    await sessionsImportValidationService.validateSession({
      session,
      sessionRepository,
      certificationCourseRepository,
    });

    if (session.certificationCandidates.length) {
      const { certificationCandidates } = session;
      const validatedCertificationCandidates = await _createCertificationCandidates({
        certificationCandidates,
        sessionId,
        isSco,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        complementaryCertificationRepository,
        certificationCandidateRepository,
      });

      session.certificationCandidates = validatedCertificationCandidates;
    }

    return session;
  });
};

async function _createCertificationCandidates({
  certificationCandidates,
  sessionId,
  isSco,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
}) {
  await bluebird.mapSeries(certificationCandidates, async (certificationCandidate) => {
    const billingMode = CertificationCandidate.translateBillingMode(certificationCandidate.billingMode);

    const domainCertificationCandidate = new CertificationCandidate({
      ...certificationCandidate,
      sessionId,
      billingMode,
    });

    const cpfBirthInformation = await sessionsImportValidationService.getValidatedCandidateBirthInformation({
      candidate: domainCertificationCandidate,
      isSco,
      isSessionsMassImport: true,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    domainCertificationCandidate.updateBirthInformation(cpfBirthInformation);

    if (domainCertificationCandidate.complementaryCertifications.length) {
      const complementaryCertification = await complementaryCertificationRepository.getByLabel({
        label: domainCertificationCandidate.complementaryCertifications[0],
      });

      domainCertificationCandidate.complementaryCertifications = [complementaryCertification];
    }

    return domainCertificationCandidate;
  });
}
