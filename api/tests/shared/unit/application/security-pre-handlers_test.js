import sinon from 'sinon';

import { CampaignBelongsToCombinedCourseError } from '../../../../src/prescription/campaign/domain/errors.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import { expect } from '../../../test-helper.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';
import { catchErr } from '../../../tooling/test-utils/error.js';

describe('Shared | Unit | Application | SecurityPreHandlers', function () {
  describe('#checkCampaignBelongsToCombinedCourse', function () {
    context('Successful case', function () {
      it('should authorize access when campaign does not belongs to a combined course', async function () {
        // given
        const checkCampaignBelongsToCombinedCourseUsecaseStub = {
          execute: sinon.stub().resolves(),
        };

        // when
        const response = await securityPreHandlers.checkCampaignBelongsToCombinedCourse(
          { params: { campaignId: '123' } },
          hFake,
          {
            checkCampaignBelongsToCombinedCourseUsecase: checkCampaignBelongsToCombinedCourseUsecaseStub,
          },
        );

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid access when the user is not the certificartion candidate', async function () {
        // given
        const checkCampaignBelongsToCombinedCourseUsecaseStub = {
          execute: sinon.stub().rejects(new CampaignBelongsToCombinedCourseError()),
        };

        // when
        const error = await catchErr(securityPreHandlers.checkCampaignBelongsToCombinedCourse)(
          { params: { campaignId: '123' } },
          hFake,
          {
            checkCampaignBelongsToCombinedCourseUsecase: checkCampaignBelongsToCombinedCourseUsecaseStub,
          },
        );

        // then
        expect(error).instanceOf(CampaignBelongsToCombinedCourseError);
      });
    });
  });

  describe('#checkAdminMemberHasRoleSuperAdmin', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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

  describe('#checkUserIsCandidate', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
      request = {
        auth: { credentials: { userId: 1234 } },
        params: {
          certificationCandidateId: 456,
        },
      };
    });

    context('Successful case', function () {
      it('should authorize access to resource when the user is the certificartion candidate', async function () {
        // given
        const checkUserIsCandidateUseCaseStub = {
          execute: sinon.stub().resolves(true),
        };
        // when
        const response = await securityPreHandlers.checkUserIsCandidate(request, hFake, {
          checkUserIsCandidateUseCase: checkUserIsCandidateUseCaseStub,
        });

        // then
        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when the user is not the certificartion candidate', async function () {
        // given
        const checkUserIsCandidateUseCaseStub = {
          execute: sinon.stub().resolves(false),
        };
        // when
        const response = await securityPreHandlers.checkUserIsCandidate(request, hFake, {
          checkUserIsCandidateUseCase: checkUserIsCandidateUseCaseStub,
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('#checkAdminMemberHasRoleCertif', function () {
    let request;

    beforeEach(function () {
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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
      sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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
    let centerRepositoryStub;

    let dependencies;

    beforeEach(function () {
      checkOrganizationIsScoAndManagingStudentUsecaseStub = { execute: sinon.stub() };
      centerRepositoryStub = {
        findActiveScoOrganizationId: sinon.stub(),
      };

      dependencies = {
        checkOrganizationIsScoAndManagingStudentUsecase: checkOrganizationIsScoAndManagingStudentUsecaseStub,
        centerRepository: centerRepositoryStub,
      };
    });

    context('Successful cases', function () {
      context('when certification center does not belong to an active sco organization', function () {
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
          dependencies.centerRepository.findActiveScoOrganizationId.resolves(null);

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
          dependencies.centerRepository.findActiveScoOrganizationId.resolves(1);

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
          dependencies.centerRepository.findActiveScoOrganizationId.resolves(1);

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
        dependencies.centerRepository.findActiveScoOrganizationId.resolves(1);

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

  describe('#hasAtLeastOneAccessOf', function () {
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
        const response = await securityPreHandlers.hasAtLeastOneAccessOf([
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
        const response = await securityPreHandlers.hasAtLeastOneAccessOf([
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
        const response = await securityPreHandlers.hasAtLeastOneAccessOf([
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
        const response = await securityPreHandlers.hasAtLeastOneAccessOf([
          belongsToOrganizationStub,
          hasRoleSuperAdminStub,
        ])(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#validateAllAccess', function () {
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

        // when
        const response = await securityPreHandlers.validateAllAccess([belongsToOrganizationStub])(request, hFake);

        // then
        expect(response).to.be.true;
      });

      it('should authorize access to resource when the user is authenticated and is Super Admin and belongs to organization', async function () {
        // given
        belongsToOrganizationStub.callsFake((request, h) => h.response(true));
        hasRoleSuperAdminStub.callsFake((request, h) => h.response(true));

        // when
        const response = await securityPreHandlers.validateAllAccess([
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
        const response = await securityPreHandlers.validateAllAccess([
          belongsToOrganizationStub,
          hasRoleSuperAdminStub,
        ])(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });

      it('should forbid resource access when user does not belong to organization but has role Super Admin', async function () {
        // given
        belongsToOrganizationStub.callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        hasRoleSuperAdminStub.callsFake((request, h) => h.response(true));

        // when
        const response = await securityPreHandlers.validateAllAccess([
          belongsToOrganizationStub,
          hasRoleSuperAdminStub,
        ])(request, hFake);

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

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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

      context('when certification center membership id is not provided', function () {
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

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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

        sinon.stub(tokenService, 'extractTokenFromAuthorizationHeader');
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

      it('should use campaignId param if id is not provided', async function () {
        // given
        const request = {
          auth: { credentials: { accessToken: 'valid.access.token', userId: Symbol('UserId') } },
          params: { campaignId: Symbol('campaignId') },
        };

        const checkAuthorizationToAccessCampaignUsecaseStub = {
          execute: sinon.stub(),
        };
        checkAuthorizationToAccessCampaignUsecaseStub.execute
          .withArgs({ campaignId: request.params.campaignId, userId: request.auth.credentials.userId })
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
              params: { certificationCourseId: 7 },
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
            { auth: { credentials: {} }, params: { certificationCourseId: 5678 } },
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
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
              params: { certificationCourseId: 5678 },
            },
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
            {
              auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
              params: { certificationCourseId: 5678 },
            },
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
        const preHandlerStub = sinon.stub();
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: preHandlerStub.resolves(true),
        };

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          {
            auth: { credentials: { accessToken: 'valid.access.token', userId: 123 } },
            params: { certificationCourseId: 7 },
          },
          hFake,
          {
            checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
          },
        );

        // then
        expect(response.source).to.be.true;
        expect(preHandlerStub).to.have.been.calledOnceWithExactly({ userId: 123, certificationCourseId: 7 });
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user does not own the certification course', async function () {
        // given
        const preHandlerStub = sinon.stub();
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: preHandlerStub.resolves(false),
        };

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          {
            auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
            params: { certificationCourseId: 5678 },
          },
          hFake,
          {
            checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
          },
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
        expect(preHandlerStub).to.have.been.calledOnceWithExactly({ userId: 1, certificationCourseId: 5678 });
      });

      it('should forbid resource access when an error is thrown by use case', async function () {
        // given
        const preHandlerStub = sinon.stub();
        const checkUserOwnsCertificationCourseUseCaseStub = {
          execute: preHandlerStub.rejects(new Error('Some error')),
        };

        // when
        const response = await securityPreHandlers.checkUserOwnsCertificationCourse(
          {
            auth: { credentials: { accessToken: 'valid.access.token', userId: 1 } },
            params: { certificationCourseId: 5678 },
          },
          hFake,
          {
            checkUserOwnsCertificationCourseUseCase: checkUserOwnsCertificationCourseUseCaseStub,
          },
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
        expect(preHandlerStub).to.have.been.calledOnceWithExactly({ userId: 1, certificationCourseId: 5678 });
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

  describe('#checkOrganizationAccess', function () {
    let request, checkOrganizationAccessUseCaseStub;

    beforeEach(function () {
      checkOrganizationAccessUseCaseStub = {
        execute: sinon.stub(),
      };

      request = {
        params: { organizationId: 1234 },
      };
    });

    context('Successful cases', function () {
      context('when organizationId given by params', function () {
        it('should check organization access', async function () {
          // given
          checkOrganizationAccessUseCaseStub.execute.resolves();

          // when
          const response = await securityPreHandlers.checkOrganizationAccess(request, hFake, {
            checkOrganizationAccessUseCase: checkOrganizationAccessUseCaseStub,
          });

          // then
          expect(
            checkOrganizationAccessUseCaseStub.execute.calledOnceWithExactly({
              organizationId: request.params.organizationId,
              campaignId: undefined,
              campaignParticipationId: undefined,
            }),
          ).to.be.true;
          expect(response.source).to.be.true;
        });
      });

      context('when organizationId given by payload attributes relationships', function () {
        it('should authorize access to resource when the organization has access given organizationId on payload', async function () {
          // given
          checkOrganizationAccessUseCaseStub.execute.resolves();
          const request = {
            params: {},
            payload: {
              data: {
                relationships: {
                  organization: {
                    data: {
                      id: '4567',
                    },
                  },
                },
              },
            },
          };

          // when
          const response = await securityPreHandlers.checkOrganizationAccess(request, hFake, {
            checkOrganizationAccessUseCase: checkOrganizationAccessUseCaseStub,
          });

          // then
          expect(
            checkOrganizationAccessUseCaseStub.execute.calledOnceWithExactly({
              organizationId: 4567,
              campaignId: undefined,
              campaignParticipationId: undefined,
            }),
          ).to.be.true;
          expect(response.source).to.be.true;
        });
      });

      context('when campaignId is given by params', function () {
        it('should authorize access to resource', async function () {
          // given
          checkOrganizationAccessUseCaseStub.execute.resolves();
          const request = {
            params: { campaignId: 1234 },
          };

          // when
          const response = await securityPreHandlers.checkOrganizationAccess(request, hFake, {
            checkOrganizationAccessUseCase: checkOrganizationAccessUseCaseStub,
          });

          // then
          expect(
            checkOrganizationAccessUseCaseStub.execute.calledOnceWithExactly({
              campaignId: 1234,
              organizationId: undefined,
              campaignParticipationId: undefined,
            }),
          ).to.be.true;
          expect(response.source).to.be.true;
        });
      });

      context('when campaignParticipationId is given by params', function () {
        it('should authorize access to resource', async function () {
          // given
          checkOrganizationAccessUseCaseStub.execute.resolves();
          const request = {
            params: { campaignParticipationId: 1234 },
          };

          // when
          const response = await securityPreHandlers.checkOrganizationAccess(request, hFake, {
            checkOrganizationAccessUseCase: checkOrganizationAccessUseCaseStub,
          });

          // then
          expect(
            checkOrganizationAccessUseCaseStub.execute.calledOnceWithExactly({
              campaignParticipationId: 1234,
              organizationId: undefined,
              campaignId: undefined,
            }),
          ).to.be.true;
          expect(response.source).to.be.true;
        });
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when organization do not have feature enabled', async function () {
        checkOrganizationAccessUseCaseStub.execute.rejects();

        const response = await securityPreHandlers.checkOrganizationAccess(request, hFake, {
          checkOrganizationAccessUseCase: checkOrganizationAccessUseCaseStub,
        });

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkOrganizationIsNotManagingStudents', function () {
    let checkOrganizationIsNotManagingStudentsUseCaseStub;
    let dependencies;

    beforeEach(function () {
      checkOrganizationIsNotManagingStudentsUseCaseStub = { execute: sinon.stub() };
      dependencies = {
        checkOrganizationIsNotManagingStudentsUseCase: checkOrganizationIsNotManagingStudentsUseCaseStub,
      };
    });

    context('Successful cases', function () {
      context('when organization is not managing students', function () {
        it('should authorize access when organization id is in request params', async function () {
          // given
          const request = {
            auth: {
              credentials: {
                accessToken: 'valid.access.token',
                userId: 1234,
              },
            },
            params: {
              organizationId: 5678,
            },
          };
          dependencies.checkOrganizationIsNotManagingStudentsUseCase.execute.resolves(true);

          // when
          const response = await securityPreHandlers.checkOrganizationIsNotManagingStudents(
            request,
            hFake,
            dependencies,
          );

          // then
          expect(response.source).to.be.true;
          expect(dependencies.checkOrganizationIsNotManagingStudentsUseCase.execute).to.have.been.calledWith({
            organizationId: 5678,
          });
        });

        it('should authorize access when organization id is in request params as id', async function () {
          // given
          const request = {
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
          dependencies.checkOrganizationIsNotManagingStudentsUseCase.execute.resolves(true);

          // when
          const response = await securityPreHandlers.checkOrganizationIsNotManagingStudents(
            request,
            hFake,
            dependencies,
          );

          // then
          expect(response.source).to.be.true;
          expect(dependencies.checkOrganizationIsNotManagingStudentsUseCase.execute).to.have.been.calledWith({
            organizationId: 5678,
          });
        });
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when user was not previously authenticated', async function () {
        // given
        const request = {
          params: {
            organizationId: 5678,
          },
        };

        // when
        const response = await securityPreHandlers.checkOrganizationIsNotManagingStudents(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
        expect(dependencies.checkOrganizationIsNotManagingStudentsUseCase.execute).not.to.have.been.called;
      });

      it('should forbid resource access when organization is managing students', async function () {
        // given
        const request = {
          auth: {
            credentials: {
              accessToken: 'valid.access.token',
              userId: 1234,
            },
          },
          params: {
            organizationId: 5678,
          },
        };
        dependencies.checkOrganizationIsNotManagingStudentsUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkOrganizationIsNotManagingStudents(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
        expect(dependencies.checkOrganizationIsNotManagingStudentsUseCase.execute).to.have.been.calledWith({
          organizationId: 5678,
        });
      });
    });
  });

  describe('#checkOrganizationDoesNotHaveFeature', function () {
    context('Successful case', function () {
      let request;

      beforeEach(function () {
        request = {
          params: { id: 1234 },
        };
      });

      it('should authorize access to resource when the organization does NOT have feature enabled', async function () {
        const featureKey = 'SOME_FEATURE';
        const organizationId = 1234;

        const checkOrganizationDoesNotHaveFeatureUseCaseStub = {
          execute: sinon.stub(),
        };

        checkOrganizationDoesNotHaveFeatureUseCaseStub.execute.withArgs({ organizationId, featureKey }).resolves(true);

        const checkOrganizationDoesNotHaveFeature = securityPreHandlers.checkOrganizationDoesNotHaveFeature(featureKey);
        const response = await checkOrganizationDoesNotHaveFeature(request, hFake, {
          checkOrganizationDoesNotHaveFeatureUseCase: checkOrganizationDoesNotHaveFeatureUseCaseStub,
        });

        expect(response.source).to.be.true;
      });
    });

    context('Error cases', function () {
      let request;

      beforeEach(function () {
        request = { params: { id: 1234 } };
      });

      it('should forbid resource access when organization does have feature enabled', async function () {
        const featureKey = 'SOME_FEATURE';
        const organizationId = 1234;

        const checkOrganizationDoesNotHaveFeatureUseCaseStub = {
          execute: sinon.stub(),
        };

        checkOrganizationDoesNotHaveFeatureUseCaseStub.execute.withArgs({ organizationId, featureKey }).resolves(false);

        const checkOrganizationDoesNotHaveFeature = securityPreHandlers.checkOrganizationDoesNotHaveFeature(featureKey);
        const response = await checkOrganizationDoesNotHaveFeature(request, hFake, {
          checkOrganizationDoesNotHaveFeatureUseCase: checkOrganizationDoesNotHaveFeatureUseCaseStub,
        });

        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });

  describe('#checkOrganizationLearnerBelongsToOrganization', function () {
    let checkOrganizationLearnerBelongsToOrganizationUseCaseStub;
    let dependencies;

    beforeEach(function () {
      checkOrganizationLearnerBelongsToOrganizationUseCaseStub = { execute: sinon.stub() };
      dependencies = {
        checkOrganizationLearnerBelongsToOrganizationUseCase: checkOrganizationLearnerBelongsToOrganizationUseCaseStub,
      };
    });

    context('Successful cases', function () {
      it('should authorize access when organization learner belongs to the organization', async function () {
        // given
        const request = {
          auth: {
            credentials: {
              accessToken: 'valid.access.token',
              userId: 1234,
            },
          },
          params: {
            organizationId: 5678,
            organizationLearnerId: 9999,
          },
        };
        dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute.resolves(true);

        // when
        const response = await securityPreHandlers.checkOrganizationLearnerBelongsToOrganization(
          request,
          hFake,
          dependencies,
        );

        // then
        expect(response.source).to.be.true;
        expect(dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute).to.have.been.calledWith(
          5678,
          9999,
        );
      });
    });

    context('Error cases', function () {
      it('should forbid resource access when organization learner does not belong to the organization', async function () {
        // given
        const request = {
          auth: {
            credentials: {
              accessToken: 'valid.access.token',
              userId: 1234,
            },
          },
          params: {
            organizationId: 5678,
            organizationLearnerId: 9999,
          },
        };
        dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute.resolves(false);

        // when
        const response = await securityPreHandlers.checkOrganizationLearnerBelongsToOrganization(
          request,
          hFake,
          dependencies,
        );

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.isTakeOver).to.be.true;
        expect(dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute).to.have.been.calledWith(
          5678,
          9999,
        );
      });

      it('should forbid resource access when use case throws an error', async function () {
        // given
        const request = {
          auth: {
            credentials: {
              accessToken: 'valid.access.token',
              userId: 1234,
            },
          },
          params: {
            organizationId: 5678,
            organizationLearnerId: 9999,
          },
        };
        dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute.rejects(new Error('Some error'));

        // when
        const response = await securityPreHandlers.checkOrganizationLearnerBelongsToOrganization(
          request,
          hFake,
          dependencies,
        );

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
        expect(dependencies.checkOrganizationLearnerBelongsToOrganizationUseCase.execute).to.have.been.calledWith(
          5678,
          9999,
        );
      });
    });
  });
});
