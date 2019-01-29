const sessionCodeService = require('./session-code-service');
const { NotFoundError } = require('../errors');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository');
const sessionRepository = require('../../infrastructure/repositories/session-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');

function linkToCertificationCenterAndSave(session) {
  return certificationCenterRepository.get(session.certificationCenterId)
    .then((certificationCenter) => session.certificationCenter = certificationCenter.name)
    .then(() => sessionRepository.save(session));
}

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

  async save({ userId, session }) {
    const user = await userRepository.get(userId);

    if(user.hasRolePixMaster && !session.certificationCenterId) {
      return sessionRepository.save(session);
    }

    return linkToCertificationCenterAndSave(session);
  }

};
