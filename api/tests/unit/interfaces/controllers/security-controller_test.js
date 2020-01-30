const { expect, sinon, hFake } = require('../../../test-helper');

const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const tokenService = require('../../../../lib/domain/services/token-service');
const checkUserIsAuthenticatedUseCase = require('../../../../lib/application/usecases/checkUserIsAuthenticated');
const checkUserHasRolePixMasterUseCase = require('../../../../lib/application/usecases/checkUserHasRolePixMaster');
const checkUserIsAdminInOrganizationUseCase = require('../../../../lib/application/usecases/checkUserIsAdminInOrganization');
const checkUserBelongsToScoOrganizationAndManagesStudentsUseCase = require('../../../../lib/application/usecases/checkUserBelongsToScoOrganizationAndManagesStudents');

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

  describe('#checkRequestedUserIsAuthenticatedUser', () => {

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
    });

    context('Successful case', () => {

      it('should authorize access to resource when the authenticated user is the same as the requested user (id)', async () => {
        // given
        const request = { params: { id: '1234' }, auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };

        // when
        const response = await securityController.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the authenticated user is the same as the requested user (userId)', async () => {
        // given
        const request = { params: { userId: '1234' }, auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };

        // when
        const response = await securityController.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', () => {

      const request = { params: { id: '1234' }, auth: { credentials: { accessToken: 'valid.access.token' } } };

      it('should forbid resource access when user was not previously authenticated', async () => {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityController.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when requested user is not the same as authenticated user', async () => {
        // given
        request.params.id = '5678';

        // when
        const response = await securityController.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsAdminInOrganization', () => {
    let isAdminInOrganizationStub;

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      isAdminInOrganizationStub = sinon.stub(checkUserIsAdminInOrganizationUseCase, 'execute');
    });

    context('Successful case', () => {
      const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } }, params: { id: 5678 } };

      beforeEach(() => {
        isAdminInOrganizationStub.resolves(true);
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization', async () => {
        // given

        // when
        const response = await securityController.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', () => {

      const request = { auth: { credentials: { accessToken: 'valid.access.token' } }, params: { id: 5678 } };

      it('should forbid resource access when user was not previously authenticated', async () => {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityController.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not ADMIN in Organization', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);

        // when
        const response = await securityController.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityController.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

    });
  });

  describe('#checkUserIsAdminInOrganizationOrHasRolePixMaster', () => {
    let isAdminInOrganizationStub;
    let hasRolePixMasterStub;

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      isAdminInOrganizationStub = sinon.stub(checkUserIsAdminInOrganizationUseCase, 'execute');
      hasRolePixMasterStub = sinon.stub(checkUserHasRolePixMasterUseCase, 'execute');
    });

    context('Successful case', () => {
      const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } }, params: { id: 5678 } };

      beforeEach(() => {
        isAdminInOrganizationStub.resolves(true);
        hasRolePixMasterStub.resolves(true);
      });

      it('should authorize access to resource when the user is authenticated and is PIX_MASTER', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);

        // when
        const response = await securityController.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization', async () => {
        // given
        checkUserHasRolePixMasterUseCase.execute.resolves(false);

        // when
        const response = await securityController.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization and is PIX_MASTER', async () => {
        // given

        // when
        const response = await securityController.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', () => {

      const request = { auth: { credentials: { accessToken: 'valid.access.token' } }, params: { id: 5678 } };

      it('should forbid resource access when user was not previously authenticated', async () => {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityController.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not ADMIN in Organization not PIX_MASTER', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);
        checkUserHasRolePixMasterUseCase.execute.resolves(false);

        // when
        const response = await securityController.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityController.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToScoOrganizationAndManagesStudents', () => {

    let belongToScoOrganizationAndManageStudentsStub;

    beforeEach(() => {
      belongToScoOrganizationAndManageStudentsStub = sinon.stub(checkUserBelongsToScoOrganizationAndManagesStudentsUseCase, 'execute');
    });

    context('Successful case', () => {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234
          }
        }
      };

      context('when organization id is in request params', () => {

        request.params = { id: 5678 };

        it('should authorize access to resource when the user is authenticated, belongs to SCO Organization and manages students', async () => {
          // given
          belongToScoOrganizationAndManageStudentsStub.resolves(true);

          // when
          const response = await securityController.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

          // then
          expect(response.source).to.equal(true);
        });
      });

      context('when organization id is in request payload', () => {

        request.payload = {
          data: {
            attributes: {
              organizationId: 5678
            }
          }
        };

        it('should authorize access to resource when the user is authenticated, belongs to SCO Organization and manages students', async () => {
          // given
          belongToScoOrganizationAndManageStudentsStub.resolves(true);

          // when
          const response = await securityController.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

          // then
          expect(response.source).to.equal(true);
        });
      });
    });

    context('Error cases', () => {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234
          }
        },
        params: { id: 5678 } };

      it('should forbid resource access when user was not previously authenticated', async () => {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityController.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to SCO Organization or manage students', async () => {
        // given
        belongToScoOrganizationAndManageStudentsStub.resolves(false);

        // when
        const response = await securityController.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async () => {
        // given
        belongToScoOrganizationAndManageStudentsStub.rejects(new Error('Some error'));

        // when
        const response = await securityController.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsAdminInScoOrganizationAndManagesStudents', () => {
    let isAdminInOrganizationStub;
    let belongsToScoOrganizationAndManagesStudentsStub;

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      isAdminInOrganizationStub = sinon.stub(checkUserIsAdminInOrganizationUseCase, 'execute');
      belongsToScoOrganizationAndManagesStudentsStub = sinon.stub(checkUserBelongsToScoOrganizationAndManagesStudentsUseCase, 'execute');
    });

    context('Successful case', () => {
      const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } }, params: { id: 5678 } };

      beforeEach(() => {
        isAdminInOrganizationStub.resolves(true);
        belongsToScoOrganizationAndManagesStudentsStub.resolves(true);
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization and belongs to a SCO Organization that manages students', async () => {
        // given

        // when
        const response = await securityController.checkUserIsAdminInScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', () => {

      const request = { auth: { credentials: { accessToken: 'valid.access.token' } }, params: { id: 5678 } };

      it('should forbid resource access when user was not previously authenticated', async () => {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityController.checkUserIsAdminInScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not ADMIN in Organization', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);
        checkUserBelongsToScoOrganizationAndManagesStudentsUseCase.execute.resolves(true);

        // when
        const response = await securityController.checkUserIsAdminInScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to a SCO Organization or does not manage students', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(true);
        checkUserBelongsToScoOrganizationAndManagesStudentsUseCase.execute.resolves(false);

        // when
        const response = await securityController.checkUserIsAdminInScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async () => {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityController.checkUserIsAdminInScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

});
