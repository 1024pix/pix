const { expect, sinon } = require('../../../test-helper');
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

    afterEach(() => {
      tokenService.extractTokenFromAuthChain.restore();
      checkUserIsAuthenticatedUseCase.execute.restore();
    });

    context('Successful case', () => {
      it('should allow access to resource - with "credentials" property filled with access_token - when the request contains the authorization header with a valid JWT access token', () => {
        // given
        const accessToken = 'valid.access.token';
        const authorizationHeader = `Bearer ${accessToken}`;
        const request = { headers: { authorization: authorizationHeader } };
        const reply = { continue: sinon.stub() };
        tokenService.extractTokenFromAuthChain.returns('valid.access.token');
        checkUserIsAuthenticatedUseCase.execute.resolves({ user_id: 1234 });

        // when
        const promise = securityController.checkUserIsAuthenticated(request, reply);

        // then
        return promise.then(() => {
          expect(reply.continue).to.have.been.calledWith({ credentials: { accessToken, userId: 1234 } });
        });
      });
    });

    context('Error cases', () => {

      let request;
      let stubTakeOver;
      let stubReplyCode;
      let reply;

      beforeEach(() => {
        request = { headers: {} };
        stubTakeOver = sinon.stub();
        stubReplyCode = sinon.stub().returns({ takeover: stubTakeOver });
        reply = sinon.stub().returns({ code: stubReplyCode });
      });

      it('should disallow access to resource when access token is missing', () => {
        // given
        tokenService.extractTokenFromAuthChain.returns(null);

        // when
        const promise = securityController.checkUserIsAuthenticated(request, reply);

        // then
        return promise.then(() => {
          expect(stubReplyCode).to.have.been.calledWith(401);
          expect(stubTakeOver).to.have.been.calledOnce;
        });
      });

      it('should disallow access to resource when access token is wrong', () => {
        // given
        request.headers.authorization = 'Bearer wrong.access.token';
        checkUserIsAuthenticatedUseCase.execute.resolves(false);

        // when
        const promise = securityController.checkUserIsAuthenticated(request, reply);

        // then
        return promise.then(() => {
          expect(stubReplyCode).to.have.been.calledWith(401);
          expect(stubTakeOver).to.have.been.calledOnce;
        });
      });

      it('should disallow access to resource when use case throws an error', () => {
        // given
        request.headers.authorization = 'Bearer valid.access.token';
        checkUserIsAuthenticatedUseCase.execute.rejects(new Error('Some error'));

        // when
        const promise = securityController.checkUserIsAuthenticated(request, reply);

        // then
        return promise.then(() => {
          expect(stubReplyCode).to.have.been.calledWith(401);
          expect(stubTakeOver).to.have.been.calledOnce;
        });
      });
    });
  });

  describe('#checkUserHasRolePixMaster', () => {

    beforeEach(() => {
      sinon.stub(checkUserHasRolePixMasterUseCase, 'execute');
    });

    afterEach(() => {
      checkUserHasRolePixMasterUseCase.execute.restore();
    });

    context('Successful case', () => {
      it('should authorize access to resource when the user is authenticated and has role PIX_MASTER', () => {
        // given
        const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
        const reply = sinon.stub();
        checkUserHasRolePixMasterUseCase.execute.resolves({ user_id: 1234 });

        // when
        const promise = securityController.checkUserHasRolePixMaster(request, reply);

        // then
        return promise.then(() => {
          expect(reply).to.have.been.calledWith(true);
        });
      });
    });

    context('Error cases', () => {

      let request;
      let stubTakeOver;
      let stubReplyCode;
      let reply;

      beforeEach(() => {
        request = { auth: { credentials: { accessToken: 'valid.access.token' } } };
        stubTakeOver = sinon.stub();
        stubReplyCode = sinon.stub().returns({ takeover: stubTakeOver });
        reply = sinon.stub().returns({ code: stubReplyCode });
      });

      it('should forbid resource access when user was not previously authenticated', () => {
        // given
        delete request.auth.credentials;

        // when
        const promise = securityController.checkUserHasRolePixMaster(request, reply);

        // then
        return promise.then(() => {
          expect(stubReplyCode).to.have.been.calledWith(403);
          expect(stubTakeOver).to.have.been.calledOnce;
        });
      });

      it('should forbid resource access when user has not role PIX_MASTER', () => {
        // given
        checkUserHasRolePixMasterUseCase.execute.resolves(false);

        // when
        const promise = securityController.checkUserHasRolePixMaster(request, reply);

        // then
        return promise.then(() => {
          expect(stubReplyCode).to.have.been.calledWith(403);
          expect(stubTakeOver).to.have.been.calledOnce;
        });
      });

      it('should forbid resource access when an error is thrown by use case', () => {
        // given
        checkUserHasRolePixMasterUseCase.execute.rejects(new Error('Some error'));

        // when
        const promise = securityController.checkUserHasRolePixMaster(request, reply);

        // then
        return promise.then(() => {
          expect(stubReplyCode).to.have.been.calledWith(403);
          expect(stubTakeOver).to.have.been.calledOnce;
        });
      });

    });
  });

});
