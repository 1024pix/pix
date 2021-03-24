const { expect, sinon } = require('../../../test-helper');
const sessionAuthorizationService = require('../../../../lib/domain/services/session-authorization-service');
const sessionRepository = require('../../../../lib/infrastructure/repositories/session-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Service | SessionAuthorizationService', function() {

  describe('#isAuthorizedToAccessSession', function() {
    const userId = 'userId';
    const sessionId = 'sessionId';

    it('should exist', function() {
      expect(sessionAuthorizationService.isAuthorizedToAccessSession).to.exist.and.to.be.a('function');
    });

    beforeEach(function() {
      sinon.stub(userRepository, 'isPixMaster');
      sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
    });

    context('when user has membership for session', function() {

      it('should return', async function() {
        // given
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).returns(true);

        // when
        const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

        // then
        expect(isAuthorized).to.be.true;
      });
    });

    context('when user has no membership for session', function() {

      beforeEach(function() {
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).returns(false);
      });

      context('when user is PixMaster', function() {

        it('should return true', async function() {
          // given
          userRepository.isPixMaster.withArgs(userId).resolves(true);

          // when
          const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

          // then
          expect(isAuthorized).to.be.true;
        });
      });

      context('when user is not PixMaster', function() {

        it('should return false', async function() {
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
