const sessionValidator = require('../../validators/session-validator.js');
const certificationCpfService = require('../certification-cpf-service.js');

module.exports = {
  async validateSession({ session, sessionRepository, certificationCourseRepository }) {
    const sessionId = session.id;
    const sessionErrors = [];

    if (sessionId) {
      if (_hasSessionInfo(session)) {
        sessionErrors.push(`Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`);
      }

      if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
        sessionErrors.push("Impossible d'ajouter un candidat à une session qui a déjà commencé.");
      }
    } else {
      const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
      if (isSessionExisting) {
        sessionErrors.push(`Session happening on ${session.date} at ${session.time} already exists`);
      }

      if (session.isSessionScheduledInThePast()) {
        sessionErrors.push(`Une session ne peut pas être programmée dans le passé`);
      }

      try {
        sessionValidator.validate(session);
      } catch (errors) {
        errors.invalidAttributes.map((error) => sessionErrors.push(error.message));
      }
    }

    if (session.certificationCandidates?.length) {
      if (_hasDuplicateCertificationCandidates(session.certificationCandidates)) {
        sessionErrors.push(`Une session contient au moins un élève en double.`);
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
