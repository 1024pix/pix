const sessionCodeService = require('./session-code-service');
const { NotFoundError } = require('../errors');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository');
const sessionRepository = require('../../infrastructure/repositories/session-repository');

module.exports = {

  get(sessionId) {
    return sessionRepository.get(sessionId);
  },

  find() {
    return sessionRepository.find();
  },

  sessionExists(accessCode) {
    return sessionCodeService.getSessionByAccessCode(accessCode)
      .then((session) => {
        if(session) {
          return session.id;
        } else {
          throw new NotFoundError();
        }
      });
  },

  save(sessionModel) {
    const promise = sessionModel.certificationCenterId
      ? certificationCenterRepository.get(sessionModel.certificationCenterId)
      : Promise.resolve();

    return promise
      .then((certificationCenter) => {
        sessionModel.certificationCenter = certificationCenter.name;
        return sessionRepository.save(sessionModel);
      })
      .catch((err) => {
        if (err instanceof NotFoundError) {
          return sessionRepository.save(sessionModel);
        }
        throw err;
      });
  }
};
