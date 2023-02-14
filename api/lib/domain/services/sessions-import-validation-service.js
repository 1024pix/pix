const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');
const { SessionWithIdAndInformationOnMassImportError } = require('../errors');

module.exports = {
  async validate({ sessions }) {
    sessions.forEach((session) => {
      const { sessionId } = session;

      const domainSession = new Session(session);
      if (domainSession.isSessionScheduledInThePast()) {
        throw new UnprocessableEntityError(`Une session ne peut pas être programmée dans le passé`);
      }

      if (sessionId) {
        if (_hasSessionInfo(domainSession)) {
          throw new SessionWithIdAndInformationOnMassImportError(
            `Merci de ne pas renseigner les informations de session pour la session: ${sessionId}`
          );
        }
      }
    });
  },
};

function _hasSessionInfo(session) {
  return session.address || session.room || session.date || session.time || session.examiner;
}
