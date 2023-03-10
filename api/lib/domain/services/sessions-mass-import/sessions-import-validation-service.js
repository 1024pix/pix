const sessionValidator = require('../../validators/session-validator.js');
const certificationCpfService = require('../certification-cpf-service.js');

module.exports = {
  async validateSession({ session, line, sessionRepository, certificationCourseRepository }) {
    const sessionId = session.id;
    const sessionErrors = [];

    if (sessionId) {
      if (_hasSessionInfo(session)) {
        _addToErrorList({ errorList: sessionErrors, line, codes: ['INFORMATION_NOT_ALLOWED_WITH_SESSION_ID'] });
      }

      if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
        _addToErrorList({ errorList: sessionErrors, line, codes: ['CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION'] });
      }
    } else {
      const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
      if (isSessionExisting) {
        _addToErrorList({ errorList: sessionErrors, line, codes: [`SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS`] });
      }

      if (session.isSessionScheduledInThePast()) {
        _addToErrorList({ errorList: sessionErrors, line, codes: ['SESSION_SCHEDULED_IN_THE_PAST'] });
      }

      const errorCodes = sessionValidator.validateForMassSessionImport(session);
      _addToErrorList({ errorList: sessionErrors, line, codes: errorCodes });
    }

    if (session.certificationCandidates?.length) {
      if (_hasDuplicateCertificationCandidates(session.certificationCandidates)) {
        _addToErrorList({ errorList: sessionErrors, line, codes: ['DUPLICATE_CANDIDATE_NOT_ALLOWED_IN_SESSION'] });
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

    if (_isExtraTimePercentageBelowOne(candidate.extraTimePercentage)) {
      _addToErrorList({ errorList: certificationCandidateErrors, line, codes: ['CANDIDATE_EXTRA_TIME_BELOW_ONE'] });
    } else {
      candidate.convertExtraTimePercentageToDecimal();
    }

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
      _addToErrorList({ errorList: certificationCandidateErrors, line, codes: [cpfBirthInformation.code] });
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
  },
};

function _addToErrorList({ errorList, line, codes = [] }) {
  const errors = codes.map((code) => ({ code, line }));
  errorList.push(...errors);
}

function _isExtraTimePercentageBelowOne(extraTimePercentage) {
  return extraTimePercentage && extraTimePercentage < 1;
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
