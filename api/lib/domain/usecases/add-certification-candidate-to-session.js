import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateAddError,
  CertificationCandidateOnFinalizedSessionError,
  CpfBirthInformationValidationError,
} from '../errors.js';

const addCertificationCandidateToSession = async function ({
  sessionId,
  certificationCandidate,
  complementaryCertification,
  sessionRepository,
  certificationCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
}) {
  certificationCandidate.sessionId = sessionId;

  const session = await sessionRepository.get(sessionId);
  if (!session.canEnrolCandidate()) {
    throw new CertificationCandidateOnFinalizedSessionError();
  }

  const isSco = await sessionRepository.isSco({ sessionId });

  try {
    certificationCandidate.validate(isSco);
  } catch (error) {
    throw CertificationCandidateAddError.fromInvalidCertificationCandidateError(error);
  }

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

  const cpfBirthInformation = await certificationCpfService.getBirthInformation({
    ...certificationCandidate,
    certificationCpfCityRepository,
    certificationCpfCountryRepository,
  });

  if (cpfBirthInformation.hasFailed()) {
    throw new CpfBirthInformationValidationError({
      code: cpfBirthInformation.firstErrorCode,
      meta: { ...cpfBirthInformation },
    });
  }

  certificationCandidate.updateBirthInformation(cpfBirthInformation);

  certificationCandidate.complementaryCertification = complementaryCertification;

  return await certificationCandidateRepository.saveInSession({
    certificationCandidate,
    sessionId: certificationCandidate.sessionId,
  });
};

export { addCertificationCandidateToSession };
