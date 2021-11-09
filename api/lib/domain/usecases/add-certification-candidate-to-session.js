const {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CpfBirthInformationValidationError,
} = require('../errors');

module.exports = async function addCertificationCandidateToSession({
  sessionId,
  certificationCandidate,
  complementaryCertifications,
  certificationCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationSubscriptionRepository,
}) {
  certificationCandidate.sessionId = sessionId;

  const version = '1.5';

  certificationCandidate.validate(version);

  const duplicateCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo({
    sessionId,
    firstName: certificationCandidate.firstName,
    lastName: certificationCandidate.lastName,
    birthdate: certificationCandidate.birthdate,
  });

  if (duplicateCandidates.length !== 0) {
    throw new CertificationCandidateByPersonalInfoTooManyMatchesError(
      'A candidate with the same personal info is already in the session.'
    );
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

  const savedCertificationCandidate = await certificationCandidateRepository.saveInSession({
    certificationCandidate,
    sessionId: certificationCandidate.sessionId,
  });

  for (const complementaryCertification of complementaryCertifications) {
    await complementaryCertificationSubscriptionRepository.save({
      complementaryCertificationId: complementaryCertification.id,
      certificationCandidateId: savedCertificationCandidate.id,
    });
  }

  return savedCertificationCandidate;
};
