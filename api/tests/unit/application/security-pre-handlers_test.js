const { expect, sinon, hFake } = require('../../test-helper');

const securityPreHandlers = require('../../../lib/application/security-pre-handlers');
const tokenService = require('../../../lib/domain/services/token-service');
const checkUserHasRolePixMasterUseCase = require('../../../lib/application/usecases/checkUserHasRolePixMaster');
const checkUserIsAdminInOrganizationUseCase = require('../../../lib/application/usecases/checkUserIsAdminInOrganization');
const checkUserBelongsToOrganizationManagingStudentsUseCase = require('../../../lib/application/usecases/checkUserBelongsToOrganizationManagingStudents');
const checkUserBelongsToScoOrganizationAndManagesStudentsUseCase = require('../../../lib/application/usecases/checkUserBelongsToScoOrganizationAndManagesStudents');
const checkUserBelongsToOrganizationUseCase = require('../../../lib/application/usecases/checkUserBelongsToOrganization');

describe('Unit | Application | SecurityPreHandlers', function() {

  describe('#checkUserHasRolePixMaster', function() {
    let hasRolePixMasterStub;

    beforeEach(function() {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      hasRolePixMasterStub = sinon.stub(checkUserHasRolePixMasterUseCase, 'execute');
    });

    context('Successful case', function() {
      const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };

      beforeEach(function() {
        hasRolePixMasterStub.resolves({ user_id: 1234 });
      });

      it('should authorize access to resource when the user is authenticated and has role PIX_MASTER', async function() {
        // given

        // when
        const response = await securityPreHandlers.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function() {

      const request = { auth: { credentials: { accessToken: 'valid.access.token' } } };

      it('should forbid resource access when user was not previously authenticated', async function() {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user has not role PIX_MASTER', async function() {
        // given
        checkUserHasRolePixMasterUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function() {
        // given
        checkUserHasRolePixMasterUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

    });
  });

  describe('#checkRequestedUserIsAuthenticatedUser', function() {

    beforeEach(function() {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
    });

    context('Successful case', function() {

      it('should authorize access to resource when the authenticated user is the same as the requested user (id)', async function() {
        // given
        const request = { params: { id: '1234' }, auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };

        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the authenticated user is the same as the requested user (userId)', async function() {
        // given
        const request = { params: { userId: '1234' }, auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };

        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function() {

      const request = { params: { id: '1234' }, auth: { credentials: { accessToken: 'valid.access.token' } } };

      it('should forbid resource access when user was not previously authenticated', async function() {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when requested user is not the same as authenticated user', async function() {
        // given
        request.params.id = '5678';

        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsAdminInOrganization', function() {
    let isAdminInOrganizationStub;

    beforeEach(function() {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      isAdminInOrganizationStub = sinon.stub(checkUserIsAdminInOrganizationUseCase, 'execute');
    });

    context('Successful case', function() {
      const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } }, params: { id: 5678 } };

      beforeEach(function() {
        isAdminInOrganizationStub.resolves(true);
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization', async function() {
        // given

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function() {

      const request = { auth: { credentials: { accessToken: 'valid.access.token' } }, params: { id: 5678 } };

      it('should forbid resource access when user was not previously authenticated', async function() {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not ADMIN in Organization', async function() {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function() {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

    });
  });

  describe('#checkUserIsAdminInOrganizationOrHasRolePixMaster', function() {
    let isAdminInOrganizationStub;
    let hasRolePixMasterStub;

    beforeEach(function() {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      isAdminInOrganizationStub = sinon.stub(checkUserIsAdminInOrganizationUseCase, 'execute');
      hasRolePixMasterStub = sinon.stub(checkUserHasRolePixMasterUseCase, 'execute');
    });

    context('Successful case', function() {
      const request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } }, params: { id: 5678 } };

      beforeEach(function() {
        isAdminInOrganizationStub.resolves(true);
        hasRolePixMasterStub.resolves(true);
      });

      it('should authorize access to resource when the user is authenticated and is PIX_MASTER', async function() {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization', async function() {
        // given
        checkUserHasRolePixMasterUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization and is PIX_MASTER', async function() {
        // given

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function() {

      const request = { auth: { credentials: { accessToken: 'valid.access.token' } }, params: { id: 5678 } };

      it('should forbid resource access when user was not previously authenticated', async function() {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not ADMIN in Organization not PIX_MASTER', async function() {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);
        checkUserHasRolePixMasterUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function() {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToOrganizationManagingStudents', function() {

    let belongToOrganizationManagingStudentsStub;

    beforeEach(function() {
      belongToOrganizationManagingStudentsStub = sinon.stub(checkUserBelongsToOrganizationManagingStudentsUseCase, 'execute');
    });

    context('Successful case', function() {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: { id: 5678 },
      };

      it('should authorize access to resource when the user is authenticated, belongs to an Organization and manages students', async function() {
        // given
        belongToOrganizationManagingStudentsStub.resolves(true);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function() {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: { id: 5678 },
      };

      it('should forbid resource access when user was not previously authenticated', async function() {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to an Organization or manage students', async function() {
        // given
        belongToOrganizationManagingStudentsStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function() {
        // given
        belongToOrganizationManagingStudentsStub.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToScoOrganizationAndManagesStudents', function() {

    let belongToScoOrganizationAndManageStudentsStub;

    beforeEach(function() {
      belongToScoOrganizationAndManageStudentsStub = sinon.stub(checkUserBelongsToScoOrganizationAndManagesStudentsUseCase, 'execute');
    });

    context('Successful case', function() {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
      };

      context('when organization id is in request params', function() {

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        request.params = { id: 5678 };

        it('should authorize access to resource when the user is authenticated, belongs to SCO Organization and manages students', async function() {
          // given
          belongToScoOrganizationAndManageStudentsStub.resolves(true);

          // when
          const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

          // then
          expect(response.source).to.equal(true);
        });
      });

      context('when organization id is in request payload', function() {

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        request.payload = {
          data: {
            attributes: {
              organizationId: 5678,
            },
          },
        };

        it('should authorize access to resource when the user is authenticated, belongs to SCO Organization and manages students', async function() {
          // given
          belongToScoOrganizationAndManageStudentsStub.resolves(true);

          // when
          const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

          // then
          expect(response.source).to.equal(true);
        });
      });
    });

    context('Error cases', function() {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: { id: 5678 } };

      it('should forbid resource access when user was not previously authenticated', async function() {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to SCO Organization or manage students', async function() {
        // given
        belongToScoOrganizationAndManageStudentsStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function() {
        // given
        belongToScoOrganizationAndManageStudentsStub.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToOrganizationOrHasRolePixMaster', function() {

    let belongsToOrganizationStub;
    let hasRolePixMasterStub;

    beforeEach(function() {
      belongsToOrganizationStub = sinon.stub(checkUserBelongsToOrganizationUseCase, 'execute');
      hasRolePixMasterStub = sinon.stub(checkUserHasRolePixMasterUseCase, 'execute');
    });

    context('Successful case', function() {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: { id: 5678 },
      };

      it('should authorize access to resource when the user is authenticated and belongs to organization', async function() {
        // given
        belongsToOrganizationStub.resolves(true);
        hasRolePixMasterStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and is PIX_MASTER', async function() {
        // given
        belongsToOrganizationStub.resolves(false);
        hasRolePixMasterStub.resolves(true);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and belongs to organization and is PIX_MASTER', async function() {
        // given
        belongsToOrganizationStub.resolves(true);
        hasRolePixMasterStub.resolves(true);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function() {
      const request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
      };

      it('should forbid resource access when user was not previously authenticated', async function() {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to organization or has role PIXMASTER', async function() {
        // given
        belongsToOrganizationStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function() {
        // given
        belongsToOrganizationStub.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationOrHasRolePixMaster(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
