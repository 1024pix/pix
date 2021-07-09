const {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CpfBirthInformationValidationError,
} = require('../errors');

const { featureToggles } = require('../../config');

module.exports = async function addCertificationCandidateToSession({
  sessionId,
  certificationCandidate,
  certificationCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  certificationCandidate.sessionId = sessionId;

  const version = featureToggles.isNewCPFDataEnabled ? '1.5' : '1.4';

  certificationCandidate.validate(version);

  const duplicateCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo({
    sessionId,
    firstName: certificationCandidate.firstName,
    lastName: certificationCandidate.lastName,
    birthdate: certificationCandidate.birthdate,
  });

  if (duplicateCandidates.length !== 0) {
    throw new CertificationCandidateByPersonalInfoTooManyMatchesError('A candidate with the same personal info is already in the session.');
  }

  if (version === '1.5') {
    const cpfBirthInformation = await certificationCpfService.getBirthInformation({
      ...certificationCandidate,
      certificationCpfCityRepository,
      certificationCpfCountryRepository,
    });

    if (cpfBirthInformation.hasFailed()) {
      throw new CpfBirthInformationValidationError(cpfBirthInformation.message);
    }

    certificationCandidate.updateBirthInformation(cpfBirthInformation);
  }

  return certificationCandidateRepository.saveInSession({
    certificationCandidate,
    sessionId: certificationCandidate.sessionId,
  });
};
