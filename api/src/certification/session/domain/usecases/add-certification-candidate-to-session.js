import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatesError,
} from '../../../../../lib/domain/errors.js';
import * as mailCheckImplementation from '../../../../shared/mail/infrastructure/services/mail-check.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../lib/domain/constants/certification-candidates-errors.js';

const addCertificationCandidateToSession = async function ({
  sessionId,
  certificationCandidate,
  complementaryCertification,
  sessionRepository,
  certificationCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  mailCheck = mailCheckImplementation,
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
    throw new CertificationCandidatesError(error);
  }

  const duplicateCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo({
    sessionId,
    firstName: certificationCandidate.firstName,
    lastName: certificationCandidate.lastName,
    birthdate: certificationCandidate.birthdate,
  });

  if (duplicateCandidates.length !== 0) {
    throw new CertificationCandidateByPersonalInfoTooManyMatchesError(
      'A candidate with the same personal info is already in the session.',
    );
  }

  const cpfBirthInformation = await certificationCpfService.getBirthInformation({
    ...certificationCandidate,
    certificationCpfCityRepository,
    certificationCpfCountryRepository,
  });

  if (cpfBirthInformation.hasFailed()) {
    throw new CertificationCandidatesError({
      code: cpfBirthInformation.firstErrorCode,
      meta: { ...cpfBirthInformation },
    });
  }

  certificationCandidate.updateBirthInformation(cpfBirthInformation);

  certificationCandidate.complementaryCertification = complementaryCertification;

  if (certificationCandidate.resultRecipientEmail) {
    try {
      await mailCheck.checkDomainIsValid(certificationCandidate.resultRecipientEmail);
    } catch {
      throw new CertificationCandidatesError({
        code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
        meta: { email: certificationCandidate.resultRecipientEmail },
      });
    }
  }
  if (certificationCandidate.email) {
    try {
      await mailCheck.checkDomainIsValid(certificationCandidate.email);
    } catch {
      throw new CertificationCandidatesError({
        code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
        meta: { email: certificationCandidate.email },
      });
    }
  }

  return await certificationCandidateRepository.saveInSession({
    certificationCandidate,
    sessionId: certificationCandidate.sessionId,
  });
};

export { addCertificationCandidateToSession };
