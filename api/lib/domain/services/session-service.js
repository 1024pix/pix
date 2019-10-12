const sessionRepository = require('../../infrastructure/repositories/session-repository');

module.exports = {

  get(sessionId) {
    return sessionRepository.get(sessionId);
  },

  find() {
    return sessionRepository.find();
  },

};
