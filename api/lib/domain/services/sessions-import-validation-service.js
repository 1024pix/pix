const { UnprocessableEntityError } = require('../../application/http-errors.js');
const { SessionWithIdAndInformationOnMassImportError, InvalidCertificationCandidate } = require('../errors.js');
const sessionValidator = require('../validators/session-validator.js');
const certificationCpfService = require('./certification-cpf-service.js');

module.exports = {
  async validateSession({ session, sessionRepository, certificationCourseRepository }) {
    const sessionId = session.id;

    if (sessionId) {
      if (_hasSessionInfo(session)) {
        throw new SessionWithIdAndInformationOnMassImportError(
          `Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`
        );
      }

      if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
        throw new UnprocessableEntityError("Impossible d'ajouter un candidat à une session qui a déjà commencé.");
      }
    } else {
      const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
      if (isSessionExisting) {
        throw new UnprocessableEntityError(`Session happening on ${session.date} at ${session.time} already exists`);
      }

      if (session.isSessionScheduledInThePast()) {
        throw new UnprocessableEntityError(`Une session ne peut pas être programmée dans le passé`);
      }

      sessionValidator.validate(session);
    }

    if (session.certificationCandidates?.length) {
      if (_hasDuplicateCertificationCandidates(session.certificationCandidates)) {
        throw new UnprocessableEntityError(`Une session contient au moins un élève en double.`);
      }
    }

    return;
  },

  async getValidatedCandidateBirthInformation({
    candidate,
    isSco,
    isSessionsMassImport,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
  }) {
    candidate.validate(isSco, isSessionsMassImport);

    const cpfBirthInformation = await certificationCpfService.getBirthInformation({
      birthCountry: candidate.birthCountry,
      birthCity: candidate.birthCity,
      birthPostalCode: candidate.birthPostalCode,
      birthINSEECode: candidate.birthINSEECode,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    if (cpfBirthInformation.hasFailed()) {
      throw new InvalidCertificationCandidate({ message: cpfBirthInformation.message, error: {} });
    }

    return {
      birthCountry: cpfBirthInformation.birthCountry,
      birthCity: cpfBirthInformation.birthCity,
      birthPostalCode: cpfBirthInformation.birthPostalCode,
      birthINSEECode: cpfBirthInformation.birthINSEECode,
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
