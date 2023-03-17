const sessionValidator = require('../../validators/session-validator.js');
const certificationCpfService = require('../certification-cpf-service.js');
const { CERTIFICATION_SESSIONS_ERRORS } = require('../../constants/sessions-errors');

module.exports = {
  async validateSession({ session, line, sessionRepository, certificationCourseRepository }) {
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

      if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
        _addToErrorList({
          errorList: sessionErrors,
          line,
          codes: [CERTIFICATION_SESSIONS_ERRORS.CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION.code],
        });
      }
    } else {
      const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
      if (isSessionExisting) {
        _addToErrorList({
          errorList: sessionErrors,
          line,
          codes: [CERTIFICATION_SESSIONS_ERRORS.SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS.code],
        });
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

    if (session.certificationCandidates?.length) {
      if (_hasDuplicateCertificationCandidates(session.certificationCandidates)) {
        _addToErrorList({
          errorList: sessionErrors,
          line,
          codes: [CERTIFICATION_SESSIONS_ERRORS.DUPLICATE_CANDIDATE_NOT_ALLOWED_IN_SESSION.code],
        });
      }
    }

    return sessionErrors;
  },

  async getValidatedCandidateBirthInformation({
    candidate,
    isSco,
    line,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
  }) {
    const certificationCandidateErrors = [];
    const errorCodes = candidate.validateForMassSessionImport(isSco);
    _addToErrorList({ errorList: certificationCandidateErrors, line, codes: errorCodes });

    const cpfBirthInformation = await certificationCpfService.getBirthInformation({
      birthCountry: candidate.birthCountry,
      birthCity: candidate.birthCity,
      birthPostalCode: candidate.birthPostalCode,
      birthINSEECode: candidate.birthINSEECode,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    if (cpfBirthInformation.hasFailed()) {
      if (
        _isErrorNotDuplicated({
          certificationCandidateErrors,
          errorCode: cpfBirthInformation.code,
        })
      ) {
        _addToErrorList({ errorList: certificationCandidateErrors, line, codes: [cpfBirthInformation.code] });
      }
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
  },

  checkNonBlockingErrors({ session, line }) {
    const nonBlockingErrorReports = [];

    if (session.certificationCandidates.length === 0) {
      _addToErrorList({
        errorList: nonBlockingErrorReports,
        line,
        codes: [CERTIFICATION_SESSIONS_ERRORS.EMPTY_SESSION.code],
      });
    }

    return nonBlockingErrorReports;
  },
};

function _isErrorNotDuplicated({ certificationCandidateErrors, errorCode }) {
  return !certificationCandidateErrors.some((error) => errorCode === error.code);
}

function _addToErrorList({ errorList, line, codes = [] }) {
  const errors = codes.map((code) => ({ code, line }));
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

function _hasDuplicateCertificationCandidates(certificationCandidates) {
  const uniqCertificationCandidates = new Set(
    certificationCandidates.map(({ lastName, firstName, birthdate }) => `${lastName}${firstName}${birthdate}`)
  );

  return uniqCertificationCandidates.size < certificationCandidates.length;
}
