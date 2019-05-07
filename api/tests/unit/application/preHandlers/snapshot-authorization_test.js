const { sinon, expect, hFake } = require('../../../test-helper');
const snapshotAuthorization = require('../../../../lib/application/preHandlers/snapshot-authorization');
const tokenService = require('../../../../lib/domain/services/token-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Pre-handler | Snapshot Authorization', () => {

  const userToken = 'token';
  const userId = 'userId';
  const organizationId = 42;

  describe('#verify', () => {
    const request = {
      params: {
        id: organizationId,
      },
      query: { userToken }
    };

    beforeEach(() => {
      sinon.stub(tokenService, 'extractUserId');
      sinon.stub(userRepository, 'get');
    });

    it('should not reject', async () => {
      // given
      tokenService.extractUserId.withArgs(userToken).returns(userId);
      userRepository.get.withArgs(userId).resolves({ boardOrganizationId: organizationId });

      // when
      const response = await snapshotAuthorization.verify(request, hFake);

      // then
      expect(response).to.be.null;
    });

    describe('When user is not found', () => {
      it('should take over the request and response with 403 status code', async () => {
        // given
        tokenService.extractUserId.withArgs(userToken).returns(userId);
        userRepository.get.withArgs(userId).rejects();

        // when
        const response = await snapshotAuthorization.verify(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

    describe('When user is not linked to the organization', () => {
      it('should take over the request and response with 403 status code', async () => {
        // given
        tokenService.extractUserId.withArgs(userToken).returns(userId);
        userRepository.get.withArgs(userId).resolves({ boardOrganizationId: null });

        // when
        const response = await snapshotAuthorization.verify(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
