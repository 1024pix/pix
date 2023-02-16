const { UnprocessableEntityError } = require('../../application/http-errors');
const { SessionWithIdAndInformationOnMassImportError } = require('../errors');
const sessionValidator = require('../validators/session-validator');

module.exports = {
  async validate({ session, sessionRepository, certificationCourseRepository }) {
    const sessionId = session.id;

    if (session.isSessionScheduledInThePast()) {
      throw new UnprocessableEntityError(`Une session ne peut pas être programmée dans le passé`);
    }

    if (sessionId) {
      if (_hasSessionInfo(session)) {
        throw new SessionWithIdAndInformationOnMassImportError(
          `Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`
        );
      }

      if (await _isSessionStarted({ certificationCourseRepository, sessionId })) {
        throw new UnprocessableEntityError("Impossible d'ajouter un candidat à une session qui a déjà commencé.");
      }
    }

    if (!sessionId) {
      sessionValidator.validate(session);

      const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
      if (isSessionExisting) {
        throw new UnprocessableEntityError(`Session happening on ${session.date} at ${session.time} already exists`);
      }
    }

    if (session.certificationCandidates?.length) {
      if (_hasDuplicateCertificationCandidates(session.certificationCandidates)) {
        throw new UnprocessableEntityError(`Une session contient au moins un élève en double.`);
      }
    }

    return;
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
