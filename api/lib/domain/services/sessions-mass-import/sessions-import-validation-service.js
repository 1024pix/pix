import { sessionValidator } from '../../validators/session-validator.js';
import * as certificationCpfService from '../certification-cpf-service.js';
import { CERTIFICATION_SESSIONS_ERRORS } from '../../constants/sessions-errors.js';
import dayjs from 'dayjs';

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
          candidate.birthdate === other.birthdate
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

const getValidatedCandidateBirthInformation = async function ({
  candidate,
  isSco,
  line,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  dependencies = { certificationCpfService },
}) {
  const certificationCandidateErrors = [];
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

  candidate.convertExtraTimePercentageToDecimal();

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

export { validateSession, getUniqueCandidates, getValidatedCandidateBirthInformation };

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

async function _isSessionStarted({ certificationCourseRepository, sessionId }) {
  const foundCertificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });
  return foundCertificationCourses.length > 0;
}
