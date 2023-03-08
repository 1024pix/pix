const sessionValidator = require('../../validators/session-validator.js');
const certificationCpfService = require('../certification-cpf-service.js');

module.exports = {
  async validateSession({ session, sessionRepository, certificationCourseRepository }) {
    const sessionId = session.id;
    const sessionErrors = [];

    if (sessionId) {
      if (_hasSessionInfo(session)) {
        sessionErrors.push({
          code: 'INFORMATION_NOT_ALLOWED_WITH_SESSION_ID',
          line: session.line,
        });
      }

      if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
        sessionErrors.push({
          code: 'CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION',
          line: session.line,
        });
      }
    } else {
      const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
      if (isSessionExisting) {
        sessionErrors.push({
          code: `SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS`,
          line: session.line,
        });
      }

      if (session.isSessionScheduledInThePast()) {
        sessionErrors.push({
          code: 'SESSION_SCHEDULED_IN_THE_PAST',
          line: session.line,
        });
      }

      try {
        sessionValidator.validate(session);
      } catch (errors) {
        errors.invalidAttributes.map((error) => sessionErrors.push({ message: error.message, line: session.line }));
      }
    }

    if (session.certificationCandidates?.length) {
      if (_hasDuplicateCertificationCandidates(session.certificationCandidates)) {
        sessionErrors.push({
          code: 'DUPLICATE_CANDIDATE_NOT_ALLOWED_IN_SESSION',
          line: session.line,
        });
      }
    }

    return sessionErrors;
  },

  async getValidatedCandidateBirthInformation({
    candidate,
    isSco,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
  }) {
    const certificationCandidateErrors = [];

    if (_isExtraTimePercentageBelowOne(candidate.extraTimePercentage)) {
      certificationCandidateErrors.push('Temps majoré doit être supérieur à 1');
    } else {
      candidate.convertExtraTimePercentageToDecimal();
    }

    const validationErrors = candidate.validateForMassSessionImport(isSco);
    if (validationErrors) {
      certificationCandidateErrors.push(...validationErrors);
    }

    const cpfBirthInformation = await certificationCpfService.getBirthInformation({
      birthCountry: candidate.birthCountry,
      birthCity: candidate.birthCity,
      birthPostalCode: candidate.birthPostalCode,
      birthINSEECode: candidate.birthINSEECode,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    if (cpfBirthInformation.hasFailed()) {
      certificationCandidateErrors.push(cpfBirthInformation.message);
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
