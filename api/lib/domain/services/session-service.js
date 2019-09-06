const sessionCodeService = require('./session-code-service');
const { NotFoundError } = require('../errors');
const sessionRepository = require('../../infrastructure/repositories/session-repository');

module.exports = {

  get(sessionId) {
    return sessionRepository.get(sessionId);
  },

  find() {
    return sessionRepository.find();
  },

  getSessionIdByAccessCode(accessCode) {
    return sessionCodeService.getSessionByAccessCode(accessCode)
      .then((session) => {
        if (session) {
          return session.id;
        } else {
          throw new NotFoundError();
        }
      });
  },

};
