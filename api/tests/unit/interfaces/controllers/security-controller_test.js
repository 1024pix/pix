const { expect, sinon, hFake } = require('../../../test-helper');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const tokenService = require('../../../../lib/domain/services/token-service');
const checkUserIsAuthenticatedUseCase = require('../../../../lib/application/usecases/checkUserIsAuthenticated');
const checkUserHasRolePixMasterUseCase = require('../../../../lib/application/usecases/checkUserHasRolePixMaster');

describe('Unit | Interfaces | Controllers | SecurityController', () => {

  describe('#checkUserIsAuthenticated', () => {

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      sinon.stub(checkUserIsAuthenticatedUseCase, 'execute');
    });

    context('Successful case', () => {

      const accessToken = 'valid.access.token';
      const authorizationHeader = `Bearer ${accessToken}`;
      const request = { headers: { authorization: authorizationHeader } };

      beforeEach(() => {
        tokenService.extractTokenFromAuthChain.returns('valid.access.token');
        checkUserIsAuthenticatedUseCase.execute.resolves({ user_id: 1234 });
      });

      it('should allow access to resource - with "credentials" property filled with access_token - when the request contains the authorization header with a valid JWT access token', async () => {
        // given

        // when
        const response = await securityController.checkUserIsAuthenticated(request, hFake);

        // then
        expect(response.authenticated).to.deep.equal({ credentials: { accessToken, userId: 1234 } });
      });

    });

    context('Error cases', () => {
      let request;

      beforeEach(() => {
        request = { headers: {} };
      });

      it('should disallow access to resource when access token is missing', async () => {
        // given
        tokenService.extractTokenFromAuthChain.returns(null);

        // when
        const response = await securityController.checkUserIsAuthenticated(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });

      it('should disallow access to resource when access token is wrong', async () => {
        // given
        request.headers.authorization = 'Bearer wrong.access.token';
        checkUserIsAuthenticatedUseCase.execute.resolves(false);

        // when
        const response = await securityController.checkUserIsAuthenticated(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });

      it('should disallow access to resource when use case throws an error', async () => {
        // given
        request.headers.authorization = 'Bearer valid.access.token';
        checkUserIsAuthenticatedUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityController.checkUserIsAuthenticated(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserHasRolePixMaster', () => {
    let hasRolePixMasterStub;

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      hasRolePixMasterStub = sinon.stub(checkUserHasRolePixMasterUseCase, 'execute');
    });

    context('Successful case', () => {
      const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };

      beforeEach(() => {
        hasRolePixMasterStub.resolves({ user_id: 1234 });
      });

      it('should authorize access to resource when the user is authenticated and has role PIX_MASTER', async () => {
        // given

        // when
        const response = await securityController.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', () => {

      const request = { auth: { credentials: { accessToken: 'valid.access.token' } } };

      it('should forbid resource access when user was not previously authenticated', async () => {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityController.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user has not role PIX_MASTER', async () => {
        // given
        checkUserHasRolePixMasterUseCase.execute.resolves(false);

        // when
        const response = await securityController.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async () => {
        // given
        checkUserHasRolePixMasterUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityController.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

    });
  });

});
