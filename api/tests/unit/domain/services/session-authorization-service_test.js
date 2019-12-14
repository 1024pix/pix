const { expect, sinon } = require('../../../test-helper');
const sessionAuthorizationService = require('../../../../lib/domain/services/session-authorization-service');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Service | SessionAuthorizationService', () => {

  describe('#isAuthorizedToAccessSession', () => {
    const userId = 'userId';
    const sessionId = 'sessionId';

    it('should exist', () => {
      expect(sessionAuthorizationService.isAuthorizedToAccessSession).to.exist.and.to.be.a('function');
    });

    beforeEach(() => {
      sinon.stub(userRepository, 'isPixMaster');
      sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
    });

    context('when user has membership for session', () => {

      it('should return', async () => {
        // given
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).returns(true);

        // when
        const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

        // then
        expect(isAuthorized).to.be.true;
      });
    });

    context('when user has no membership for session', () => {

      beforeEach(() => {
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).returns(false);
      });

      context('when user is PixMaster', () => {

        it('should return true', async () => {
          // given
          userRepository.isPixMaster.withArgs(userId).resolves(true);

          // when
          const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

          // then
          expect(isAuthorized).to.be.true;
        });
      });

      context('when user is not PixMaster', () => {

        it('should return false', async () => {
          // given
          userRepository.isPixMaster.withArgs(userId).resolves(false);

          // when
          const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

          // then
          expect(isAuthorized).to.be.false;
        });
      });
    });
  });
});
