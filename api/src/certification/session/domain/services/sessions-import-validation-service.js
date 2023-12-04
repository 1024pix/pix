import * as sessionValidator from '../validators/session-validator.js';
import * as certificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import { CERTIFICATION_SESSIONS_ERRORS } from '../../../../../lib/domain/constants/sessions-errors.js';
import dayjs from 'dayjs';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../lib/domain/constants/certification-candidates-errors.js';
import * as mailCheck from '../../../../shared/mail/infrastructure/services/mail-check.js';

const validateSession = async function ({
  session,
  line,
  certificationCenterId,
  sessionRepository,
  certificationCourseRepository,
}) {
  const sessionId = session.id;
  const sessionErrors = [];

  if (sessionId) {
    if (_hasSessionInfo(session)) {
      _addToErrorList({
        errorList: sessionErrors,
        line,
        codes: [CERTIFICATION_SESSIONS_ERRORS.INFORMATION_NOT_ALLOWED_WITH_SESSION_ID.code],
      });
    }

    if (_isSessionIdFormatValid(sessionId)) {
      if (await _isSessionExistingInCertificationCenter({ sessionId, certificationCenterId, sessionRepository })) {
        if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
          _addToErrorList({
            errorList: sessionErrors,
            line,
            codes: [CERTIFICATION_SESSIONS_ERRORS.CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION.code],
          });
        }
      } else {
        _addToErrorList({
          errorList: sessionErrors,
          line,
          codes: [CERTIFICATION_SESSIONS_ERRORS.SESSION_ID_NOT_EXISTING.code],
        });
      }
    } else {
      _addToErrorList({
        errorList: sessionErrors,
        line,
        codes: [CERTIFICATION_SESSIONS_ERRORS.SESSION_ID_NOT_VALID.code],
      });
    }
  } else {
    if (_isDateAndTimeValid(session)) {
      const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
      if (isSessionExisting) {
        _addToErrorList({
          errorList: sessionErrors,
          line,
          codes: [CERTIFICATION_SESSIONS_ERRORS.SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS.code],
        });
      }
    }

    if (session.isSessionScheduledInThePast()) {
      _addToErrorList({
        errorList: sessionErrors,
        line,
        codes: [CERTIFICATION_SESSIONS_ERRORS.SESSION_SCHEDULED_IN_THE_PAST.code],
      });
    }

    const errorCodes = sessionValidator.validateForMassSessionImport(session);
    _addToErrorList({ errorList: sessionErrors, line, codes: errorCodes });
  }

  if (session.certificationCandidates.length === 0) {
    _addToErrorList({
      errorList: sessionErrors,
      line,
      codes: [CERTIFICATION_SESSIONS_ERRORS.EMPTY_SESSION.code],
      isBlocking: false,
    });
  }

  return sessionErrors;
};

const getUniqueCandidates = function (candidates) {
  const duplicateCandidateErrors = [];

  const uniqueCandidates = candidates.filter((candidate, index) => {
    const isFirstOccurence =
      index ===
      candidates.findIndex(
        (other) =>
          candidate.firstName === other.firstName &&
          candidate.lastName === other.lastName &&
          candidate.birthdate === other.birthdate,
      );

    if (!isFirstOccurence) {
      _addToErrorList({
        errorList: duplicateCandidateErrors,
        line: candidate.line,
        codes: [CERTIFICATION_SESSIONS_ERRORS.DUPLICATE_CANDIDATE_IN_SESSION.code],
        isBlocking: false,
      });
    }

    return isFirstOccurence;
  });

  return { uniqueCandidates, duplicateCandidateErrors };
};

const getValidatedComplementaryCertificationForMassImport = async function ({
  complementaryCertifications = [],
  line,
  complementaryCertificationRepository,
}) {
  const certificationCandidateComplementaryErrors = [];

  if (_hasMoreThanOneComplementaryCertifications(complementaryCertifications)) {
    _addToErrorList({
      errorList: certificationCandidateComplementaryErrors,
      line,
      codes: [CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code],
    });

    return { certificationCandidateComplementaryErrors, complementaryCertification: null };
  }

  if (complementaryCertifications?.[0]) {
    const complementaryCertification = await complementaryCertificationRepository.getByLabel({
      label: complementaryCertifications[0],
    });

    return { certificationCandidateComplementaryErrors, complementaryCertification };
  }

  return { certificationCandidateComplementaryErrors, complementaryCertification: null };
};

const getValidatedCandidateBirthInformation = async function ({
  candidate,
  isSco,
  line,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  dependencies = { certificationCpfService },
}) {
  const certificationCandidateErrors = [];

  if (candidate.extraTimePercentage) {
    if (candidate.extraTimePercentage >= 1) {
      candidate.convertExtraTimePercentageToDecimal();
    } else {
      _addToErrorList({
        errorList: certificationCandidateErrors,
        line,
        codes: [CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EXTRA_TIME_OUT_OF_RANGE.code],
      });
    }
  }

  const errorCodes = candidate.validateForMassSessionImport(isSco);
  _addToErrorList({ errorList: certificationCandidateErrors, line, codes: errorCodes });

  const cpfBirthInformation = await dependencies.certificationCpfService.getBirthInformation({
    birthCountry: candidate.birthCountry,
    birthCity: candidate.birthCity,
    birthPostalCode: candidate.birthPostalCode,
    birthINSEECode: candidate.birthINSEECode,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
  });

  if (cpfBirthInformation.hasFailed()) {
    cpfBirthInformation.errors.forEach(({ code: errorCode }) => {
      if (
        _isErrorNotDuplicated({
          certificationCandidateErrors,
          errorCode,
        })
      ) {
        _addToErrorList({ errorList: certificationCandidateErrors, line, codes: [errorCode] });
      }
    });
  }

  return {
    certificationCandidateErrors,
    cpfBirthInformation: {
      birthCountry: cpfBirthInformation.birthCountry,
      birthCity: cpfBirthInformation.birthCity,
      birthPostalCode: cpfBirthInformation.birthPostalCode,
      birthINSEECode: cpfBirthInformation.birthINSEECode,
    },
  };
};

const validateCandidateEmails = async function ({ candidate, line, dependencies = { mailCheck } }) {
  const certificationCandidateErrors = [];
  await _validateEmail({
    email: candidate.resultRecipientEmail,
    mailCheck: dependencies.mailCheck,
    errorCode: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
    certificationCandidateErrors,
    line,
  });
  await _validateEmail({
    email: candidate.email,
    mailCheck: dependencies.mailCheck,
    errorCode: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
    certificationCandidateErrors,
    line,
  });

  return certificationCandidateErrors;
};

export {
  validateSession,
  getUniqueCandidates,
  getValidatedCandidateBirthInformation,
  validateCandidateEmails,
  getValidatedComplementaryCertificationForMassImport,
};

function _hasMoreThanOneComplementaryCertifications(complementaryCertifications) {
  return complementaryCertifications?.length > 1;
}

function _isDateAndTimeValid(session) {
  return dayjs(`${session.date} ${session.time}`, 'YYYY-MM-DD HH:mm', true).isValid();
}

function _isSessionIdFormatValid(sessionId) {
  return !isNaN(sessionId);
}

async function _isSessionExistingInCertificationCenter({ sessionId, certificationCenterId, sessionRepository }) {
  return await sessionRepository.isSessionExistingBySessionAndCertificationCenterIds({
    sessionId,
    certificationCenterId,
  });
}

function _isErrorNotDuplicated({ certificationCandidateErrors, errorCode }) {
  return !certificationCandidateErrors.some((error) => errorCode === error.code);
}

function _addToErrorList({ errorList, line, codes = [], isBlocking = true }) {
  const errors = codes.map((code) => ({ code, line, isBlocking }));
  errorList.push(...errors);
}

function _hasSessionInfo(session) {
  return session.address || session.room || session.date || session.time || session.examiner;
}

async function _validateEmail({ email, mailCheck, errorCode, certificationCandidateErrors, line }) {
  if (email) {
    try {
      await mailCheck.checkDomainIsValid(email);
    } catch {
      return _addToErrorList({
        errorList: certificationCandidateErrors,
        line,
        codes: [errorCode],
      });
    }
  }
}

async function _isSessionStarted({ certificationCourseRepository, sessionId }) {
  const foundCertificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });
  return foundCertificationCourses.length > 0;
}
