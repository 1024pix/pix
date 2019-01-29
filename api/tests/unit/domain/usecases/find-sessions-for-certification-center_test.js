const { expect, domainBuilder } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | find-sessions-for-certification-center', () => {

  it('should return sessions of the certificationCenter', async () => {
    // given
    const user = domainBuilder.buildUser();
    const certificationCenterId = user.certificationCenterMemberships[0].certificationCenter.id;
    const sessions = [domainBuilder.buildSession({ certificationCenterId })];
    const sessionRepository = {
      findByCertificationCenterId: () => Promise.resolve(sessions)
    };
    const userRepository = {
      getWithCertificationCenterMemberships: () => Promise.resolve(user)
    };

    // when
    const sessionsFound = await usecases.findSessionsForCertificationCenter({ userId: user.id, certificationCenterId, userRepository, sessionRepository });

    // then
    return expect(sessionsFound).to.be.deep.equal(sessions);
  });

  it('should throw a forbidden error if user is not a member of the given certification center', () => {
    // given
    const userId = 1;
    const certificationCenterId = 1;
    const sessionRepository = {
      findByCertificationCenterId: () => {}
    };
    const userRepository = {
      getWithCertificationCenterMemberships: () => Promise.resolve(new User())
    };

    // when
    const promise = usecases.findSessionsForCertificationCenter({ userId, certificationCenterId, sessionRepository, userRepository });

    // then
    return promise.catch((error) => {
      expect(error).to.be.instanceOf(ForbiddenAccess);
      expect(error.message).to.equal('User 1 is not a member of certification center 1');
    });

  });
});
