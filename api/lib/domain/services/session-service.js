const sessionCodeService = require('./session-code-service');
const { NotFoundError, ForbiddenAccess } = require('../errors');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository');
const sessionRepository = require('../../infrastructure/repositories/session-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');

function _createSessionAsPixMaster(certificationCenterId, session) {
  if(certificationCenterId) {
    return _setCertifCenterNameInSessionAndSave(session, certificationCenterId);
  }
  return sessionRepository.save(session);
}

async function _createSessionAsNormalUser(userId, certificationCenterId, session) {
  const userWithCertifCenters = await userRepository.getWithCertificationCenterMemberships(userId);

  if(userWithCertifCenters.hasAccessToCertificationCenter(certificationCenterId)) {
    return _setCertifCenterNameInSessionAndSave(session, certificationCenterId);
  }
  throw new ForbiddenAccess('User is not a member of the certification center');
}

function _setCertifCenterNameInSessionAndSave(session, certificationCenterId) {
  return certificationCenterRepository.get(certificationCenterId)
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
    const certificationCenterId = session.certificationCenterId;
    const user = await userRepository.get(userId);

    // We keep this code here so that Anne-Cécile can still create the sessions the old way through Postman, for now :)
    // To remove when we will not create sessions with no certifCenterId through Postman anymore
    if(user.hasRolePixMaster) {
      return _createSessionAsPixMaster(certificationCenterId, session);
    }

    return _createSessionAsNormalUser(userId, certificationCenterId, session);
  }

};
