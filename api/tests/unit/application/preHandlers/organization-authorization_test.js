const { expect, sinon, hFake } = require('../../../test-helper');
const organizationAuthorization = require('../../../../lib/application/preHandlers/organization-authorization');
const tokenService = require('../../../../lib/domain/services/token-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | Pre-handler | organization-authorization', () => {

  describe('#verify', () => {

    const USER_ID = 1234;
    const ORGANIZATION_ID = 5678;

    const request = {
      headers: { authorization: 'VALID_TOKEN' },
      params: { id: ORGANIZATION_ID },
    };

    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(tokenService, 'extractTokenFromAuthChain');
      sandbox.stub(tokenService, 'extractUserId');
      sandbox.stub(userRepository, 'getWithMemberships');
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('Authorized access', () => {

      beforeEach(() => {
        tokenService.extractTokenFromAuthChain.returns(true);
        tokenService.extractUserId.returns(USER_ID);
      });

      it('should return "true" when user has role PIX_MASTER', async () => {
        // given
        userRepository.getWithMemberships.resolves({ hasRolePixMaster: true });

        // when
        const result = await organizationAuthorization.verify(request, hFake);

        // then
        expect(result).to.equal(true);
      });

      it('should return "true" when user is a member of the organization', async () => {
        // given
        userRepository.getWithMemberships.resolves({ hasAccessToOrganization: () => true });

        // when
        const result = await organizationAuthorization.verify(request, hFake);

        // then
        expect(result).to.equal(true);
      });
    });

    describe('Forbidden access', function() {

      it('should responds with a 403 HTTP status and takeover the response when user is not allowed to access resource', async () => {
        // given
        userRepository.getWithMemberships.resolves({ hasAccessToOrganization: () => false });

        // when
        const response = await organizationAuthorization.verify(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });

  });
});
