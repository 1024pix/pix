const hash = require('object-hash');
const moment = require('moment');
const sessionCodeService = require('./session-code-service');
const { NotFoundError } = require('../errors');
const sessionRepository = require('../../infrastructure/repositories/session-repository');

module.exports = {
  getCurrentCode() {
    const date = moment().utc().format('YYYY-MM-DD HH');

    return hash(date).slice(0, 6);
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
