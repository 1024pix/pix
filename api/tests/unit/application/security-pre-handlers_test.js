const { expect, sinon, hFake, domainBuilder } = require('../../test-helper');

const securityPreHandlers = require('../../../lib/application/security-pre-handlers');
const tokenService = require('../../../lib/domain/services/token-service');
const checkAdminMemberHasRoleSuperAdminUseCase = require('../../../lib/application/usecases/checkAdminMemberHasRoleSuperAdmin');
const checkAdminMemberHasRoleCertifUseCase = require('../../../lib/application/usecases/checkAdminMemberHasRoleCertif');
const checkAdminMemberHasRoleSupportUseCase = require('../../../lib/application/usecases/checkAdminMemberHasRoleSupport');
const checkAdminMemberHasRoleMetierUseCase = require('../../../lib/application/usecases/checkAdminMemberHasRoleMetier');
const checkUserIsAdminInOrganizationUseCase = require('../../../lib/application/usecases/checkUserIsAdminInOrganization');
const checkUserBelongsToLearnersOrganizationUseCase = require('../../../lib/application/usecases/checkUserBelongsToLearnersOrganization');
const checkUserBelongsToOrganizationManagingStudentsUseCase = require('../../../lib/application/usecases/checkUserBelongsToOrganizationManagingStudents');
const checkUserBelongsToScoOrganizationAndManagesStudentsUseCase = require('../../../lib/application/usecases/checkUserBelongsToScoOrganizationAndManagesStudents');
const checkUserIsMemberOfAnOrganizationUseCase = require('../../../lib/application/usecases/checkUserIsMemberOfAnOrganization');
const checkUserIsMemberOfCertificationCenterUseCase = require('../../../lib/application/usecases/checkUserIsMemberOfCertificationCenter');
const checkAuthorizationToManageCampaignUsecase = require('../../../lib/application/usecases/checkAuthorizationToManageCampaign');
const checkUserIsMemberOfCertificationCenterSessionUsecase = require('../../../lib/application/usecases/checkUserIsMemberOfCertificationCenterSession');
const certificationIssueReportRepository = require('../../../lib/infrastructure/repositories/certification-issue-report-repository');
const checkUserOwnsCertificationCourseUseCase = require('../../../lib/application/usecases/checkUserOwnsCertificationCourse');
describe('Unit | Application | SecurityPreHandlers', function () {
  describe('#checkAdminMemberHasRoleSuperAdmin', function () {
    let hasRoleSuperAdminStub;
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      hasRoleSuperAdminStub = sinon.stub(checkAdminMemberHasRoleSuperAdminUseCase, 'execute');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      beforeEach(function () {
        hasRoleSuperAdminStub.resolves({ user_id: 1234 });
      });

      it('should authorize access to resource when the user is authenticated and has role Super Admin', async function () {
        // given

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Super Admin', async function () {
        // given
        checkAdminMemberHasRoleSuperAdminUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        checkAdminMemberHasRoleSuperAdminUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAdminMemberHasRoleCertif', function () {
    let hasRoleCertifStub;
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      hasRoleCertifStub = sinon.stub(checkAdminMemberHasRoleCertifUseCase, 'execute');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      beforeEach(function () {
        hasRoleCertifStub.resolves({ user_id: 1234 });
      });

      it('should authorize access to resource when the user is authenticated and has role Certif', async function () {
        // given

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Certif', async function () {
        // given
        checkAdminMemberHasRoleCertifUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        checkAdminMemberHasRoleCertifUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAdminMemberHasRoleSupport', function () {
    let hasRoleSupportStub;
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      hasRoleSupportStub = sinon.stub(checkAdminMemberHasRoleSupportUseCase, 'execute');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      beforeEach(function () {
        hasRoleSupportStub.resolves({ user_id: 1234 });
      });

      it('should authorize access to resource when the user is authenticated and has role Support', async function () {
        // given

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Support', async function () {
        // given
        checkAdminMemberHasRoleSupportUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        checkAdminMemberHasRoleSupportUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAdminMemberHasRoleMetier', function () {
    let hasRoleMetierStub;
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      hasRoleMetierStub = sinon.stub(checkAdminMemberHasRoleMetierUseCase, 'execute');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      beforeEach(function () {
        hasRoleMetierStub.resolves({ user_id: 1234 });
      });

      it('should authorize access to resource when the user is authenticated and has role Metier', async function () {
        // given

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Metier', async function () {
        // given
        checkAdminMemberHasRoleMetierUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        checkAdminMemberHasRoleMetierUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkRequestedUserIsAuthenticatedUser', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      request = {
        params: { id: '1234' },
        auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } },
      };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the authenticated user is the same as the requested user (id)', async function () {
        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });

      it('should authorize access to resource when the authenticated user is the same as the requested user (userId)', async function () {
        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when requested user is not the same as authenticated user', async function () {
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

  describe('#checkUserIsAdminInOrganization', function () {
    let isAdminInOrganizationStub;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      isAdminInOrganizationStub = sinon.stub(checkUserIsAdminInOrganizationUseCase, 'execute');
    });

    context('Successful case', function () {
      let request;

      beforeEach(function () {
        isAdminInOrganizationStub.resolves(true);
        request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } },
          params: { id: 5678 },
        };
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization', async function () {
        // given

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      let request;

      beforeEach(function () {
        isAdminInOrganizationStub.resolves(true);
        request = { auth: { credentials: { accessToken: 'valid.access.token' } }, params: { id: 5678 } };
      });

      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not ADMIN in Organization', async function () {
        // given
        checkUserIsAdminInOrganizationUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
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

  describe('#checkUserBelongsToOrganizationManagingStudents', function () {
    let belongToOrganizationManagingStudentsStub;
    let request;
    beforeEach(function () {
      belongToOrganizationManagingStudentsStub = sinon.stub(
        checkUserBelongsToOrganizationManagingStudentsUseCase,
        'execute'
      );
      request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: { id: 5678 },
      };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated, belongs to an Organization and manages students', async function () {
        // given
        belongToOrganizationManagingStudentsStub.resolves(true);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to an Organization or manage students', async function () {
        // given
        belongToOrganizationManagingStudentsStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
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

  describe('#checkUserBelongsToOrganizationLearnerOrganization', function () {
    let belongsToLearnerOrganizationStub;
    let request;
    beforeEach(function () {
      belongsToLearnerOrganizationStub = sinon.stub(checkUserBelongsToLearnersOrganizationUseCase, 'execute');
      request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: { id: 5678 },
      };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and belongs to the same organization as the learner', async function () {
        // given
        belongsToLearnerOrganizationStub.resolves(true);

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it("should forbid resource access when user does not belong to the learner's organization", async function () {
        // given
        belongsToLearnerOrganizationStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // if organization learner ressource is missing, a 403 error response is sent not to give further information to unauthorized people

        // given
        belongsToLearnerOrganizationStub.rejects(new Error());

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToScoOrganizationAndManagesStudents', function () {
    let belongToScoOrganizationAndManageStudentsStub;
    let request;

    beforeEach(function () {
      belongToScoOrganizationAndManageStudentsStub = sinon.stub(
        checkUserBelongsToScoOrganizationAndManagesStudentsUseCase,
        'execute'
      );
      request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: {
          id: 5678,
        },
      };
    });

    context('Successful case', function () {
      context('when organization id is in request params', function () {
        it('should authorize access to resource when the user is authenticated, belongs to SCO Organization and manages students', async function () {
          // given
          belongToScoOrganizationAndManageStudentsStub.resolves(true);

          // when
          const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(
            request,
            hFake
          );

          // then
          expect(response.source).to.equal(true);
        });
      });

      context('when organization id is in request payload', function () {
        it('should authorize access to resource when the user is authenticated, belongs to SCO Organization and manages students', async function () {
          // given
          request.payload = {
            data: {
              attributes: {
                organizationId: 5678,
              },
            },
          };
          belongToScoOrganizationAndManageStudentsStub.resolves(true);

          // when
          const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(
            request,
            hFake
          );

          // then
          expect(response.source).to.equal(true);
        });
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to SCO Organization or manage students', async function () {
        // given
        belongToScoOrganizationAndManageStudentsStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
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

  describe('#adminMemberHasAtLeastOneAccessOf', function () {
    let belongsToOrganizationStub;
    let hasRoleSuperAdminStub;
    let request;

    beforeEach(function () {
      belongsToOrganizationStub = sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization');
      hasRoleSuperAdminStub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
      request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
        params: { id: 5678 },
      };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and belongs to organization', async function () {
        // given
        belongsToOrganizationStub.callsFake((request, h) => h.response(true));
        hasRoleSuperAdminStub.callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

        // when
        const response = await securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
          belongsToOrganizationStub,
          hasRoleSuperAdminStub,
        ])(request, hFake);

        // then
        expect(response).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and is Super Admin', async function () {
        // given
        belongsToOrganizationStub.callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        hasRoleSuperAdminStub.callsFake((request, h) => h.response(true));

        // when
        const response = await securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
          belongsToOrganizationStub,
          hasRoleSuperAdminStub,
        ])(request, hFake);

        // then
        expect(response).to.equal(true);
      });

      it('should authorize access to resource when the user is authenticated and belongs to organization and is Super Admin', async function () {
        // given
        belongsToOrganizationStub.callsFake((request, h) => h.response(true));
        hasRoleSuperAdminStub.callsFake((request, h) => h.response(true));

        // when
        const response = await securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
          belongsToOrganizationStub,
          hasRoleSuperAdminStub,
        ])(request, hFake);

        // then
        expect(response).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user does not belong to organization nor has role Super Admin', async function () {
        // given
        belongsToOrganizationStub.callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        hasRoleSuperAdminStub.callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

        // when
        const response = await securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
          belongsToOrganizationStub,
          hasRoleSuperAdminStub,
        ])(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsMemberOfAnOrganization', function () {
    let isMemberOfAnOrganizationStub;
    let request;

    beforeEach(function () {
      isMemberOfAnOrganizationStub = sinon.stub(checkUserIsMemberOfAnOrganizationUseCase, 'execute');
      request = {
        auth: {
          credentials: {
            accessToken: 'valid.access.token',
            userId: 1234,
          },
        },
      };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and member of an organization', async function () {
        // given
        isMemberOfAnOrganizationStub.resolves(true);

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake);
        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of any organization', async function () {
        // given
        isMemberOfAnOrganizationStub.resolves(false);

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        isMemberOfAnOrganizationStub.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsMemberOfCertificationCenter', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and is member in certification center', async function () {
        // given
        const user = domainBuilder.buildUser();
        const certificationCenter = domainBuilder.buildCertificationCenter();
        const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
          user,
          certificationCenter,
        });
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: certificationCenterMembership.user.id } },
          params: { certificationCenterId: certificationCenterMembership.certificationCenter.id },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthChain');
        sinon.stub(checkUserIsMemberOfCertificationCenterUseCase, 'execute').resolves(true);

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user is not member in certification center', async function () {
        // given
        const userId = domainBuilder.buildUser().id;
        const certificationCenterId = domainBuilder.buildCertificationCenter().id;
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId } },
          params: { certificationCenterId },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthChain');
        sinon.stub(checkUserIsMemberOfCertificationCenterUseCase, 'execute').resolves(false);

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('#checkAuthorizationToManageCampaign', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and is admin in organization and owner of the campaign', async function () {
        // given
        const user = domainBuilder.buildUser();
        const organization = domainBuilder.buildOrganization();
        domainBuilder.buildMembership({ organization, user, organizationRole: 'ADMIN' });
        const campaign = domainBuilder.buildCampaign({ organizationId: organization.id, ownerId: user.id });

        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: user.id } },
          params: { id: campaign.id },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthChain');
        sinon
          .stub(checkAuthorizationToManageCampaignUsecase, 'execute')
          .withArgs({ userId: user.id, campaignId: campaign.id })
          .resolves(true);

        // when
        const response = await securityPreHandlers.checkAuthorizationToManageCampaign(request, hFake);

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user is member but does not own the campaign', async function () {
        // given
        const user = domainBuilder.buildUser();
        const otherUser = domainBuilder.buildUser();
        const organization = domainBuilder.buildOrganization();
        domainBuilder.buildMembership({ organization, user, organizationRole: 'MEMBER' });
        const campaign = domainBuilder.buildCampaign({ organizationId: organization.id, ownerId: otherUser.id });

        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: user.id } },
          params: { id: campaign.id },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthChain');
        sinon
          .stub(checkAuthorizationToManageCampaignUsecase, 'execute')
          .withArgs({ userId: user.id, campaignId: campaign.id })
          .resolves(false);

        // when
        const response = await securityPreHandlers.checkAuthorizationToManageCampaign(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is a member of the organization center', async function () {
        // given
        const userId = 123;
        const certificationCourseId = 7;
        sinon
          .stub(checkUserIsMemberOfCertificationCenterSessionUsecase, 'execute')
          .withArgs({ userId, certificationCourseId })
          .resolves(true);

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
              params: { id: 7 },
            },
            hFake
          );

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given & when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            { auth: { credentials: {} }, params: { id: 5678 } },
            hFake
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of the organization center', async function () {
        // given
        sinon.stub(checkUserIsMemberOfCertificationCenterSessionUsecase, 'execute').resolves(false);

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
            hFake
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        sinon.stub(checkUserIsMemberOfCertificationCenterSessionUsecase, 'execute').rejects(new Error('Some error'));

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
            hFake
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is a member of the organization center', async function () {
        // given
        const userId = 123;
        const certificationCourseId = 7;
        const certificationIssueReportId = 666;
        sinon
          .stub(certificationIssueReportRepository, 'get')
          .withArgs(certificationIssueReportId)
          .resolves({ certificationCourseId });
        sinon
          .stub(checkUserIsMemberOfCertificationCenterSessionUsecase, 'execute')
          .withArgs({ userId, certificationCourseId })
          .resolves(true);

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
              params: { id: 666 },
            },
            hFake
          );

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given & when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: {} }, params: { id: 5678 } },
            hFake
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of the organization center', async function () {
        // given
        sinon.stub(certificationIssueReportRepository, 'get').resolves({ certificationCourseId: 7 });
        sinon.stub(checkUserIsMemberOfCertificationCenterSessionUsecase, 'execute').resolves(false);

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        sinon.stub(certificationIssueReportRepository, 'get').resolves({ certificationCourseId: 7 });
        sinon.stub(checkUserIsMemberOfCertificationCenterSessionUsecase, 'execute').rejects(new Error('Some error'));

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by repo', async function () {
        // given
        sinon.stub(certificationIssueReportRepository, 'get').rejects(new Error('Some error'));

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserOwnsCertificationCourse', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user owns the certification course', async function () {
        // given
        const userId = 123;
        const certificationCourseId = 7;
        sinon
          .stub(checkUserOwnsCertificationCourseUseCase, 'execute')
          .withArgs({ userId, certificationCourseId })
          .resolves(true);

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          {
            auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
            params: { id: 7 },
          },
          hFake
        );

        // then
        expect(response.source).to.equal(true);
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given & when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          { auth: { credentials: {} }, params: { id: 5678 } },
          hFake
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not own the certification course', async function () {
        // given
        sinon.stub(checkUserOwnsCertificationCourseUseCase, 'execute').resolves(false);

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
          hFake
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        sinon.stub(checkUserOwnsCertificationCourseUseCase, 'execute').rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
          hFake
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
