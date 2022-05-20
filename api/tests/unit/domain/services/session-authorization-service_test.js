const { expect, sinon } = require('../../../test-helper');
const sessionAuthorizationService = require('../../../../lib/domain/services/session-authorization-service');
const sessionRepository = require('../../../../lib/infrastructure/repositories/sessions/session-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Service | SessionAuthorizationService', function () {
  describe('#isAuthorizedToAccessSession', function () {
    const userId = 'userId';
    const sessionId = 'sessionId';

    it('should exist', function () {
      expect(sessionAuthorizationService.isAuthorizedToAccessSession).to.exist.and.to.be.a('function');
    });

    beforeEach(function () {
      sinon.stub(userRepository, 'isSuperAdmin');
      sinon.stub(userRepository, 'isSupport');
      sinon.stub(userRepository, 'isCertif');
      sinon.stub(sessionRepository, 'doesUserHaveCertificationCenterMembershipForSession');
    });

    context('when user has membership for session', function () {
      it('should return', async function () {
        // given
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.withArgs(userId, sessionId).returns(true);

        // when
        const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

        // then
        expect(isAuthorized).to.be.true;
      });
    });

    context('when user has no membership for session', function () {
      beforeEach(function () {
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession
          .withArgs(userId, sessionId)
          .returns(false);
      });

      context('when user is SuperAdmin', function () {
        it('should return true', async function () {
          // given
          userRepository.isSuperAdmin.withArgs(userId).resolves(true);

          // when
          const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

          // then
          expect(isAuthorized).to.be.true;
        });
      });

      context('when user is Support', function () {
        it('should return true', async function () {
          // given
          userRepository.isSupport.withArgs(userId).resolves(true);

          // when
          const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

          // then
          expect(isAuthorized).to.be.true;
        });
      });

      context('when user is Certif', function () {
        it('should return true', async function () {
          // given
          userRepository.isCertif.withArgs(userId).resolves(true);

          // when
          const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

          // then
          expect(isAuthorized).to.be.true;
        });
      });

      context('when user is neither SuperAdmin, nor Support, nor Certif', function () {
        it('should return false', async function () {
          // given
          userRepository.isSuperAdmin.withArgs(userId).resolves(false);
          userRepository.isCertif.withArgs(userId).resolves(false);
          userRepository.isSupport.withArgs(userId).resolves(false);

          // when
          const isAuthorized = await sessionAuthorizationService.isAuthorizedToAccessSession({ userId, sessionId });

          // then
          expect(isAuthorized).to.be.false;
        });
      });
    });
  });
});
