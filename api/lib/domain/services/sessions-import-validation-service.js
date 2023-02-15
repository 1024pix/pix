const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const { SessionWithIdAndInformationOnMassImportError } = require('../errors');
const { mapSeries } = require('bluebird');
const sessionCodeService = require('./session-code-service');

module.exports = {
  async validate({ sessions, certificationCenterId, certificationCenter, sessionRepository }) {
    return mapSeries(sessions, async (session) => {
      const { sessionId } = session;

      const accessCode = sessionCodeService.getNewSessionCode();
      const supervisorPassword = Session.generateSupervisorPassword();
      const domainSession = new Session({
        ...session,
        certificationCenterId,
        certificationCenter,
        accessCode,
        supervisorPassword,
      });
      if (domainSession.isSessionScheduledInThePast()) {
        throw new UnprocessableEntityError(`Une session ne peut pas être programmée dans le passé`);
      }

      if (sessionId) {
        if (_hasSessionInfo(domainSession)) {
          throw new SessionWithIdAndInformationOnMassImportError(
            `Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`
          );
        }

        const isSessionExisting = await sessionRepository.isSessionExisting({ ...session });
        if (isSessionExisting) {
          throw new UnprocessableEntityError(`Session happening on ${session.date} at ${session.time} already exists`);
        }
      }
    });
  },
};

function _hasSessionInfo(session) {
  return session.address || session.room || session.date || session.time || session.examiner;
}
