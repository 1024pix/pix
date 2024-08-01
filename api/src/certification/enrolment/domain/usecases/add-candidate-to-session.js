/**
 * @typedef {import ('./index.js').SessionRepository} SessionRepository
 * @typedef {import ('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import ('./index.js').EnrolledCandidateRepository} EnrolledCandidateRepository
 * @typedef {import ('./index.js').CertificationCpfService} CertificationCpfService
 * @typedef {import ('./index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import ('./index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 */

import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatesError,
} from '../../../../shared/domain/errors.js';
import * as mailCheckImplementation from '../../../../shared/mail/infrastructure/services/mail-check.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../shared/domain/constants/certification-candidates-errors.js';
import { insert } from '../../infrastructure/repositories/candidate-repository.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {CandidateRepository} params.candidateRepository
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 * @param {CertificationCpfService} params.certificationCpfService
 * @param {CertificationCpfCountryRepository} params.certificationCpfCountryRepository
 * @param {CertificationCpfCityRepository} params.certificationCpfCityRepository
 */
// TODO MVP - write my test ! (oups)
export async function addCandidateToSession({
  sessionId,
  candidate,
  sessionRepository,
  candidateRepository,
  enrolledCandidateRepository,
  certificationCpfService,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  mailCheck = mailCheckImplementation,
  normalizeStringFnc,
}) {
  candidate.sessionId = sessionId;

  const session = await sessionRepository.get({ id: sessionId });
  if (!session.canEnrolCandidate) {
    throw new CertificationCandidateOnFinalizedSessionError();
  }

  const isSco = await sessionRepository.isSco({ id: sessionId });

  try {
    candidate.validate(isSco);
  } catch (error) {
    throw new CertificationCandidatesError({
      code: error.code,
      meta: { value: error.meta },
    });
  }
  const enrolledCandidates = await enrolledCandidateRepository.findBySessionId({ sessionId });
  const isAlreadyEnrolled = session.isCandidateAlreadyEnrolled({
    enrolledCandidates,
    candidatePersonalInfo: {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      birthdate: candidate.birthdate,
    },
    normalizeStringFnc,
  });

  if (isAlreadyEnrolled) {
    throw new CertificationCandidateByPersonalInfoTooManyMatchesError(
      'A candidate with the same personal info is already in the session.',
    );
  }

  const cpfBirthInformation = await certificationCpfService.getBirthInformation({
    ...candidate,
    certificationCpfCityRepository,
    certificationCpfCountryRepository,
  });

  if (cpfBirthInformation.hasFailed()) {
    throw new CertificationCandidatesError({
      code: cpfBirthInformation.firstErrorCode,
      meta: { ...cpfBirthInformation },
    });
  }

  candidate.updateBirthInformation(cpfBirthInformation);

  if (candidate.resultRecipientEmail) {
    try {
      await mailCheck.checkDomainIsValid(candidate.resultRecipientEmail);
    } catch {
      throw new CertificationCandidatesError({
        code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
        meta: { email: candidate.resultRecipientEmail },
      });
    }
  }
  if (candidate.email) {
    try {
      await mailCheck.checkDomainIsValid(candidate.email);
    } catch {
      throw new CertificationCandidatesError({
        code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
        meta: { email: candidate.email },
      });
    }
  }

  return candidateRepository.insert(candidate);
}
