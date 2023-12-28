import { expect, sinon, hFake, domainBuilder } from '../../test-helper.js';
import { securityPreHandlers } from '../../../lib/application/security-pre-handlers.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import { NotFoundError } from '../../../lib/domain/errors.js';

describe('Unit | Application | SecurityPreHandlers', function () {
  describe('#checkAdminMemberHasRoleSuperAdmin', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and has role Super Admin', async function () {
        // given
        const checkAdminMemberHasRoleSuperAdminUseCaseStub = {
          execute: sinon.stub().resolves({ user_id: 1234 }),
        };
        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake, {
          checkAdminMemberHasRoleSuperAdminUseCase: checkAdminMemberHasRoleSuperAdminUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkAdminMemberHasRoleSuperAdminUseCaseStub = {
          execute: sinon.stub(),
        };
        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake, {
          checkAdminMemberHasRoleSuperAdminUseCase: checkAdminMemberHasRoleSuperAdminUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Super Admin', async function () {
        // given
        const checkAdminMemberHasRoleSuperAdminUseCaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake, {
          checkAdminMemberHasRoleSuperAdminUseCase: checkAdminMemberHasRoleSuperAdminUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkAdminMemberHasRoleSuperAdminUseCaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSuperAdmin(request, hFake, {
          checkAdminMemberHasRoleSuperAdminUseCase: checkAdminMemberHasRoleSuperAdminUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAdminMemberHasRoleCertif', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and has role Certif', async function () {
        // given
        const checkAdminMemberHasRoleCertifUseCaseStub = { execute: sinon.stub().returns({ user_id: 1234 }) };
        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake, {
          checkAdminMemberHasRoleCertifUseCase: checkAdminMemberHasRoleCertifUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkAdminMemberHasRoleCertifUseCaseStub = { execute: sinon.stub() };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake, {
          checkAdminMemberHasRoleCertifUseCase: checkAdminMemberHasRoleCertifUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Certif', async function () {
        // given
        const checkAdminMemberHasRoleCertifUseCaseStub = { execute: sinon.stub().resolves(false) };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake, {
          checkAdminMemberHasRoleCertifUseCase: checkAdminMemberHasRoleCertifUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkAdminMemberHasRoleCertifUseCaseStub = { execute: sinon.stub().rejects(new Error('Some error')) };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleCertif(request, hFake, {
          checkAdminMemberHasRoleCertifUseCase: checkAdminMemberHasRoleCertifUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAdminMemberHasRoleSupport', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and has role Support', async function () {
        // given
        const checkAdminMemberHasRoleSupportUseCaseStub = { execute: sinon.stub().resolves({ user_id: 1234 }) };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake, {
          checkAdminMemberHasRoleSupportUseCase: checkAdminMemberHasRoleSupportUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkAdminMemberHasRoleSupportUseCaseStub = { execute: sinon.stub() };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake, {
          checkAdminMemberHasRoleSupportUseCase: checkAdminMemberHasRoleSupportUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Support', async function () {
        // given
        const checkAdminMemberHasRoleSupportUseCaseStub = { execute: sinon.stub().resolves(false) };
        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake, {
          checkAdminMemberHasRoleSupportUseCase: checkAdminMemberHasRoleSupportUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkAdminMemberHasRoleSupportUseCaseStub = { execute: sinon.stub().rejects(new Error('Some error')) };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleSupport(request, hFake, {
          checkAdminMemberHasRoleSupportUseCase: checkAdminMemberHasRoleSupportUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAdminMemberHasRoleMetier', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      request = { auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } } };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and has role Metier', async function () {
        // given
        const checkAdminMemberHasRoleMetierUseCaseStub = { execute: sinon.stub().resolves({ user_id: 1234 }) };
        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake, {
          checkAdminMemberHasRoleMetierUseCase: checkAdminMemberHasRoleMetierUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkAdminMemberHasRoleMetierUseCaseStub = { execute: sinon.stub() };
        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake, {
          checkAdminMemberHasRoleMetierUseCase: checkAdminMemberHasRoleMetierUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not have role Metier', async function () {
        // given
        const checkAdminMemberHasRoleMetierUseCaseStub = { execute: sinon.stub().resolves(false) };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake, {
          checkAdminMemberHasRoleMetierUseCase: checkAdminMemberHasRoleMetierUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkAdminMemberHasRoleMetierUseCase = { execute: sinon.stub().rejects(new Error('Some error')) };

        // when
        const response = await securityPreHandlers.checkAdminMemberHasRoleMetier(request, hFake, {
          checkAdminMemberHasRoleMetierUseCase: checkAdminMemberHasRoleMetierUseCase,
        });

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
        expect(response.source).to.be.true;
      });

      it('should authorize access to resource when the authenticated user is the same as the requested user (userId)', async function () {
        // when
        const response = await securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, hFake);

        // then
        expect(response.source).to.be.true;
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
    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
    });

    context('Successful case', function () {
      let request;

      beforeEach(function () {
        request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: 1234 } },
          params: { id: 5678 },
        };
      });

      it('should authorize access to resource when the user is authenticated and is ADMIN in Organization', async function () {
        // given
        const checkUserIsAdminInOrganizationUseCaseStub = { execute: sinon.stub().resolves(true) };
        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake, {
          checkUserIsAdminInOrganizationUseCase: checkUserIsAdminInOrganizationUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      let request;

      beforeEach(function () {
        request = { auth: { credentials: { accessToken: 'valid.access.token' } }, params: { id: 5678 } };
      });

      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkUserIsAdminInOrganizationUseCaseStub = { execute: sinon.stub() };

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake, {
          checkUserIsAdminInOrganizationUseCase: checkUserIsAdminInOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not ADMIN in Organization', async function () {
        // given
        const checkUserIsAdminInOrganizationUseCaseStub = { execute: sinon.stub().resolves(false) };

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake, {
          checkUserIsAdminInOrganizationUseCase: checkUserIsAdminInOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkUserIsAdminInOrganizationUseCaseStub = { execute: sinon.stub().rejects(new Error('Some error')) };

        // when
        const response = await securityPreHandlers.checkUserIsAdminInOrganization(request, hFake, {
          checkUserIsAdminInOrganizationUseCase: checkUserIsAdminInOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToOrganizationManagingStudents', function () {
    let request;
    beforeEach(function () {
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
        const checkUserBelongsToOrganizationManagingStudentsUseCaseStub = { execute: sinon.stub().resolves(true) };

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake, {
          checkUserBelongsToOrganizationManagingStudentsUseCase:
            checkUserBelongsToOrganizationManagingStudentsUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkUserBelongsToOrganizationManagingStudentsUseCaseStub = { execute: sinon.stub() };

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake, {
          checkUserBelongsToOrganizationManagingStudentsUseCase:
            checkUserBelongsToOrganizationManagingStudentsUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to an Organization or manage students', async function () {
        // given
        const checkUserBelongsToOrganizationManagingStudentsUseCaseStub = { execute: sinon.stub().resolves(false) };

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake, {
          checkUserBelongsToOrganizationManagingStudentsUseCase:
            checkUserBelongsToOrganizationManagingStudentsUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkUserBelongsToOrganizationManagingStudentsUseCaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response = await securityPreHandlers.checkUserBelongsToOrganizationManagingStudents(request, hFake, {
          checkUserBelongsToOrganizationManagingStudentsUseCase:
            checkUserBelongsToOrganizationManagingStudentsUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToOrganizationLearnerOrganization', function () {
    let request;
    beforeEach(function () {
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
        const checkUserBelongsToLearnersOrganizationUseCaseStub = {
          execute: sinon.stub().resolves(true),
        };

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake, {
          checkUserBelongsToLearnersOrganizationUseCase: checkUserBelongsToLearnersOrganizationUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkUserBelongsToLearnersOrganizationUseCaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake, {
          checkUserBelongsToLearnersOrganizationUseCase: checkUserBelongsToLearnersOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it("should forbid resource access when user does not belong to the learner's organization", async function () {
        // given
        const checkUserBelongsToLearnersOrganizationUseCaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake, {
          checkUserBelongsToLearnersOrganizationUseCase: checkUserBelongsToLearnersOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // if organization learner ressource is missing, a 403 error response is sent not to give further information to unauthorized people

        // given
        const checkUserBelongsToLearnersOrganizationUseCaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response = await securityPreHandlers.checkUserBelongsToLearnersOrganization(request, hFake, {
          checkUserBelongsToLearnersOrganizationUseCase: checkUserBelongsToLearnersOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserBelongsToScoOrganizationAndManagesStudents', function () {
    let request;

    beforeEach(function () {
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
          const checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub = {
            execute: sinon.stub().resolves(true),
          };
          // when
          const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(
            request,
            hFake,
            {
              checkUserBelongsToScoOrganizationAndManagesStudentsUseCase:
                checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub,
            },
          );

          // then
          expect(response.source).to.be.true;
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
          const checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub = {
            execute: sinon.stub().resolves(true),
          };

          // when
          const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(
            request,
            hFake,
            {
              checkUserBelongsToScoOrganizationAndManagesStudentsUseCase:
                checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub,
            },
          );

          // then
          expect(response.source).to.be.true;
        });
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake, {
          checkUserBelongsToScoOrganizationAndManagesStudentsUseCase:
            checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to SCO Organization or manage students', async function () {
        // given
        const checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake, {
          checkUserBelongsToScoOrganizationAndManagesStudentsUseCase:
            checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };
        // when
        const response = await securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents(request, hFake, {
          checkUserBelongsToScoOrganizationAndManagesStudentsUseCase:
            checkUserBelongsToScoOrganizationAndManagesStudentsUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkCertificationCenterIsNotScoManagingStudents', function () {
    let checkOrganizationIsScoAndManagingStudentUsecaseStub;
    let organizationRepositoryStub;

    let dependencies;

    beforeEach(function () {
      checkOrganizationIsScoAndManagingStudentUsecaseStub = { execute: sinon.stub() };
      organizationRepositoryStub = {
        getIdByCertificationCenterId: sinon.stub(),
      };

      dependencies = {
        checkOrganizationIsScoAndManagingStudentUsecase: checkOrganizationIsScoAndManagingStudentUsecaseStub,
        organizationRepository: organizationRepositoryStub,
      };
    });

    context('Successful cases', function () {
      context('when certification center does not belong to an organization', function () {
        it('should authorize access to resource when the user is authenticated', async function () {
          // given
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: 1234,
              },
            },
            params: {
              certificationCenterId: 5678,
            },
          };
          dependencies.checkOrganizationIsScoAndManagingStudentUsecase.execute.resolves(false);
          dependencies.organizationRepository.getIdByCertificationCenterId.rejects(new NotFoundError());

          // when
          const response = await securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
            request,
            hFake,
            dependencies,
          );

          // then
          expect(response.source).to.be.true;
        });
      });

      context('when certification center id is in request params', function () {
        it('should authorize access to resource when the user is authenticated, member of certification center and the organization associated is not SCO managing students', async function () {
          // given
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: 1234,
              },
            },
            params: {
              certificationCenterId: 5678,
            },
          };
          dependencies.checkOrganizationIsScoAndManagingStudentUsecase.execute.resolves(false);
          dependencies.organizationRepository.getIdByCertificationCenterId.resolves(1);

          // when
          const response = await securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
            request,
            hFake,
            dependencies,
          );

          // then
          expect(response.source).to.be.true;
        });
      });

      context('when certification center id is in request payload', function () {
        it('should authorize access to resource when the user is authenticated, member of certification center and the organization associated is not SCO managing students', async function () {
          // given
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: 1234,
              },
            },
            payload: {
              data: {
                attributes: {
                  certificationCenterId: 5678,
                },
              },
            },
          };
          dependencies.checkOrganizationIsScoAndManagingStudentUsecase.execute.resolves(false);
          dependencies.organizationRepository.getIdByCertificationCenterId.resolves(1);

          // when
          const response = await securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
            request,
            hFake,
            dependencies,
          );

          // then
          expect(response.source).to.be.true;
        });
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const request = {
          payload: {
            data: {
              attributes: {
                certificationCenterId: 5678,
              },
            },
          },
        };

        // when
        const response = await securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
          request,
          hFake,
          dependencies,
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when the certification center does belong to SCO Organization and manage students', async function () {
        // given
        const request = {
          auth: {
            credentials: {
              accessToken: 'valid.access.token',
              userId: 1234,
            },
          },
          payload: {
            data: {
              attributes: {
                certificationCenterId: 5678,
              },
            },
          },
        };
        dependencies.checkOrganizationIsScoAndManagingStudentUsecase.execute.resolves(true);
        dependencies.organizationRepository.getIdByCertificationCenterId.resolves(1);

        // when
        const response = await securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents(
          request,
          hFake,
          dependencies,
        );

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
        expect(response).to.be.true;
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
        expect(response).to.be.true;
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
        expect(response).to.be.true;
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
    let request;

    beforeEach(function () {
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
        const checkUserIsMemberOfAnOrganizationUseCaseStub = {
          execute: sinon.stub().resolves(true),
        };

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake, {
          checkUserIsMemberOfAnOrganizationUseCase: checkUserIsMemberOfAnOrganizationUseCaseStub,
        });
        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        delete request.auth.credentials;
        const checkUserIsMemberOfAnOrganizationUseCaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake, {
          checkUserIsMemberOfAnOrganizationUseCase: checkUserIsMemberOfAnOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of any organization', async function () {
        // given
        const checkUserIsMemberOfAnOrganizationUseCaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake, {
          checkUserIsMemberOfAnOrganizationUseCase: checkUserIsMemberOfAnOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkUserIsMemberOfAnOrganizationUseCaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfAnOrganization(request, hFake, {
          checkUserIsMemberOfAnOrganizationUseCase: checkUserIsMemberOfAnOrganizationUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkUserIsAdminOfCertificationCenter', function () {
    context('Successful case', function () {
      it('authorizes access to resource when the user is authenticated and is admin of the certification center', async function () {
        // given
        const user = domainBuilder.buildUser();
        const certificationCenter = domainBuilder.buildCertificationCenter();
        const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
          user,
          certificationCenter,
          role: 'ADMIN',
        });
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: certificationCenterMembership.user.id } },
          params: { certificationCenterId: certificationCenterMembership.certificationCenter.id },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthChain');
        const checkUserIsAdminOfCertificationCenterUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };

        // when
        const response = await securityPreHandlers.checkUserIsAdminOfCertificationCenter(request, hFake, {
          checkUserIsAdminOfCertificationCenterUsecase: checkUserIsAdminOfCertificationCenterUsecaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('forbids resource access when user is not admin in certification center', async function () {
        // given
        const user = domainBuilder.buildUser();
        const certificationCenter = domainBuilder.buildCertificationCenter();
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: user.id } },
          params: { certificationCenterId: certificationCenter.id },
        };

        sinon.stub(tokenService, 'extractTokenFromAuthChain');
        const checkUserIsAdminOfCertificationCenterUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkUserIsAdminOfCertificationCenter(request, hFake, {
          checkUserIsAdminOfCertificationCenterUsecase: checkUserIsAdminOfCertificationCenterUsecaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('#checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId', function () {
    context('successful cases', function () {
      context('when user is an admin of the certification center', function () {
        it('authorizes access to the resource', async function () {
          // given
          const adminUser = domainBuilder.buildUser();
          const certificationCenter = domainBuilder.buildCertificationCenter();
          const certificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
          });
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: adminUser.id,
              },
            },
            params: {
              certificationCenterInvitationId: certificationCenterInvitation.id,
            },
          };
          const checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase = {
            execute: sinon.stub().resolves(true),
          };

          // when
          const response =
            await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId(
              request,
              hFake,
              { checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase },
            );

          // then
          expect(response.source).to.be.true;
        });
      });
    });

    context('error cases', function () {
      context('when user is not an admin of the certification center', function () {
        it('forbids access to the resource', async function () {
          // given
          const user = domainBuilder.buildUser();
          const certificationCenterInvitation = domainBuilder.buildCertificationCenterInvitation();
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: user.id,
              },
            },
            params: {
              certificationCenterInvitationId: certificationCenterInvitation.id,
            },
          };
          const checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase = {
            execute: sinon.stub().resolves(false),
          };

          // when
          const response =
            await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId(
              request,
              hFake,
              { checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase },
            );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when certification center invitation id is not provided', function () {
        it('forbids access to the resource', async function () {
          // given
          const user = domainBuilder.buildUser();
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: user.id,
              },
            },
            params: {},
          };
          const checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase = {
            execute: sinon.stub().resolves(false),
          };

          // when
          const response =
            await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId(
              request,
              hFake,
              { checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase },
            );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId', function () {
    context('successful cases', function () {
      context('when user is an admin of the certification center', function () {
        it('authorizes access to the resource', async function () {
          // given
          const adminUser = domainBuilder.buildUser();
          const certificationCenter = domainBuilder.buildCertificationCenter();
          const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
          });
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: adminUser.id,
              },
            },
            params: {
              certificationCenterMembershipId: certificationCenterMembership.id,
            },
          };
          const checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase = {
            execute: sinon.stub().resolves(true),
          };

          // when
          const response =
            await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
              request,
              hFake,
              { checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase },
            );

          // then
          expect(response.source).to.be.true;
        });
      });
    });

    context('error cases', function () {
      context('when user is not an admin of the certification center', function () {
        it('forbids access to the resource', async function () {
          // given
          const user = domainBuilder.buildUser();
          const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership();
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: user.id,
              },
            },
            params: {
              certificationCenterMembershipId: certificationCenterMembership.id,
            },
          };
          const checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase = {
            execute: sinon.stub().resolves(false),
          };

          // when
          const response =
            await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipId(
              request,
              hFake,
              { checkUserIsAdminOfCertificationCenterWithCertificationCenterMembershipIdUseCase },
            );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when certification center invitation id is not provided', function () {
        it('forbids access to the resource', async function () {
          // given
          const user = domainBuilder.buildUser();
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: user.id,
              },
            },
            params: {},
          };
          const checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase = {
            execute: sinon.stub().resolves(false),
          };

          // when
          const response =
            await securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId(
              request,
              hFake,
              { checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationIdUseCase },
            );

          // then
          expect(response.statusCode).to.equal(403);
        });
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
        const checkUserIsMemberOfCertificationCenterUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake, {
          checkUserIsMemberOfCertificationCenterUsecase: checkUserIsMemberOfCertificationCenterUsecaseStub,
        });

        // then
        expect(response.source).to.be.true;
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
        const checkUserIsMemberOfCertificationCenterUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkUserIsMemberOfCertificationCenter(request, hFake, {
          checkUserIsMemberOfCertificationCenterUsecase: checkUserIsMemberOfCertificationCenterUsecaseStub,
        });

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
        const checkAuthorizationToManageCampaignUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };
        // when
        const response = await securityPreHandlers.checkAuthorizationToManageCampaign(request, hFake, {
          checkAuthorizationToManageCampaignUsecase: checkAuthorizationToManageCampaignUsecaseStub,
        });

        // then
        expect(response.source).to.be.true;
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
        const checkAuthorizationToManageCampaignUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkAuthorizationToManageCampaign(request, hFake, {
          checkAuthorizationToManageCampaignUsecase: checkAuthorizationToManageCampaignUsecaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkAuthorizationToAccessCampaign', function () {
    context('Successful case', function () {
      it('should authorize access to resource when the user is authenticated and is admin in organization and owner of the campaign', async function () {
        // given
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: Symbol('UserId') } },
          params: { id: Symbol('campaignId') },
        };

        const checkAuthorizationToAccessCampaignUsecaseStub = {
          execute: sinon.stub(),
        };
        checkAuthorizationToAccessCampaignUsecaseStub.execute
          .withArgs({ campaignId: request.params.id, userId: request.auth.credentials.userId })
          .resolves(true);
        // when
        const response = await securityPreHandlers.checkAuthorizationToAccessCampaign(request, hFake, {
          checkAuthorizationToAccessCampaignUsecase: checkAuthorizationToAccessCampaignUsecaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user is member but does not own the campaign', async function () {
        // given
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: Symbol('UserId') } },
          params: { id: Symbol('campaignId') },
        };

        const checkAuthorizationToAccessCampaignUsecaseStub = {
          execute: sinon.stub(),
        };
        checkAuthorizationToAccessCampaignUsecaseStub.execute
          .withArgs({ campaignId: request.params.id, userId: request.auth.userId })
          .resolves(false);
        // when
        const response = await securityPreHandlers.checkAuthorizationToAccessCampaign(request, hFake, {
          checkAuthorizationToAccessCampaignUsecase: checkAuthorizationToAccessCampaignUsecaseStub,
        });

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
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
              params: { id: 7 },
            },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            { auth: { credentials: {} }, params: { id: 5678 } },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of the organization center', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
            hFake,
            {
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
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
        const certificationCourseId = 7;

        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().withArgs(certificationCourseId).resolves({ certificationCourseId }),
        };
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(true),
        };
        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
              params: { id: 666 },
            },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub(),
        };

        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: {} }, params: { id: 5678 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user is not a member of the organization center', async function () {
        // given
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().resolves(false),
        };
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().resolves({ certificationCourseId: 7 }),
        };

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().resolves({ certificationCourseId: 7 }),
        };
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
          );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by repo', async function () {
        // given
        const certificationIssueReportRepositoryStub = {
          get: sinon.stub().rejects(new Error('Some error')),
        };
        const checkUserIsMemberOfCertificationCenterSessionUsecaseStub = {
          execute: sinon.stub(),
        };
        // when
        const response =
          await securityPreHandlers.checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId(
            { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 666 } },
            hFake,
            {
              certificationIssueReportRepository: certificationIssueReportRepositoryStub,
              checkUserIsMemberOfCertificationCenterSessionUsecase:
                checkUserIsMemberOfCertificationCenterSessionUsecaseStub,
            },
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
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: sinon.stub().resolves(true),
        };

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          {
            auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
            params: { id: 7 },
          },
          hFake,
          {
            checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
          },
        );

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: sinon.stub(),
        };

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          { auth: { credentials: {} }, params: { id: 5678 } },
          hFake,
          {
            checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
          },
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not own the certification course', async function () {
        // given
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: sinon.stub().resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
          hFake,
          {
            checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
          },
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: sinon.stub().rejects(new Error('Some error')),
        };

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          { auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } }, params: { id: 5678 } },
          hFake,
          {
            checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
          },
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#makeCheckOrganizationHasFeature', function () {
    context('Successful case', function () {
      let request;

      beforeEach(function () {
        request = {
          params: { id: 1234 },
        };
      });

      it('should authorize access to resource when the organization has feature enabled', async function () {
        const featureKey = 'ma feature';
        const organizationId = 1234;

        const checkOrganizationHasFeatureUseCaseStub = {
          execute: sinon.stub(),
        };

        checkOrganizationHasFeatureUseCaseStub.execute.withArgs({ organizationId, featureKey }).resolves();

        const checkOrganizationHasFeature = await securityPreHandlers.makeCheckOrganizationHasFeature(featureKey);
        const response = await checkOrganizationHasFeature(request, hFake, {
          checkOrganizationHasFeatureUseCase: checkOrganizationHasFeatureUseCaseStub,
        });

        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      let request;

      beforeEach(function () {
        request = { params: { id: 1234 } };
      });

      it('should forbid resource access when organization do not have feature enabled', async function () {
        const featureKey = 'ma feature';
        const organizationId = 1234;

        const checkOrganizationHasFeatureUseCaseStub = {
          execute: sinon.stub(),
        };

        checkOrganizationHasFeatureUseCaseStub.execute.withArgs({ organizationId, featureKey }).rejects();

        const checkOrganizationHasFeature = await securityPreHandlers.makeCheckOrganizationHasFeature(featureKey);
        const response = await checkOrganizationHasFeature(request, hFake, {
          checkOrganizationHasFeatureUseCase: checkOrganizationHasFeatureUseCaseStub,
        });

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
