const sessionCodeService = require('./session-code-service');
const { NotFoundError } = require('../errors');
const sessionRepository = require('../../infrastructure/repositories/session-repository');

module.exports = {
  get(sessionId) {
    return sessionRepository.get(sessionId);
  },

  sessionExists(accessCode) {
    return sessionCodeService.getSessionByAccessCode(accessCode)
      .then(session => {
        if(session) {
          return session.id;
        } else {
          throw new NotFoundError();
        }
      });
  },

  save(sessionModel) {
    return sessionRepository.save(sessionModel);
  }
};
