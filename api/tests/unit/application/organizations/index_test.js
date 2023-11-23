import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { organizationController } from '../../../../lib/application/organizations/organization-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import * as moduleUnderTest from '../../../../lib/application/organizations/index.js';

describe('Unit | Router | organization-router', function () {
  describe('GET /api/admin/organizations', function () {
    const method = 'GET';

    it('should return OK (200) when request is valid', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // given
      const url = '/api/admin/organizations?filter[id]=&filter[name]=DRA&filter[type]=SCO&page[number]=3&page[size]=25';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when request is invalid', function () {
      it('should return BadRequest (400) if id is not numeric', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const idNotNumeric = 'foo';
        const url = `/api/admin/organizations?filter[id]=${idNotNumeric}`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      context('when id is outside number limits', function () {
        it('should return HTTP statusCode 400 if id number is less than the minimum value', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const minNumberLimit = identifiersType.positiveInteger32bits.min;
          const wrongNumber = minNumberLimit - 1;
          const url = `/api/admin/organizations?filter[id]=${wrongNumber}`;

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return HTTP statusCode 400 if id number is greater than the maximum value', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const maxNumberLimit = identifiersType.positiveInteger32bits.max;
          const wrongNumber = maxNumberLimit + 1;
          const url = `/api/admin/organizations?filter[id]=${wrongNumber}`;

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('POST /api/admin/organizations', function () {
    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/organizations', {
        data: {
          type: 'organizations',
          attributes: {
            name: 'Super Tag',
            type: 'SCO',
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/organizations/{id}/archive', function () {
    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(organizationController, 'archiveOrganization').resolves('ok');

      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/organizations/1/archive');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(organizationController.archiveOrganization);
    });
  });

  describe('POST /api/admin/organizations/{id}/attach-target-profiles', function () {
    it('should allow to controller if user has role SUPER_ADMIN', async function () {
      // given
      sinon.stub(organizationController, 'attachTargetProfiles').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        'target-profile-ids': [1, 2],
      };

      // when
      await httpTestServer.request('POST', '/api/admin/organizations/1/attach-target-profiles', payload);

      // then
      sinon.assert.calledOnce(organizationController.attachTargetProfiles);
    });

    it('should allow to controller if user has role SUPPORT', async function () {
      // given
      sinon.stub(organizationController, 'attachTargetProfiles').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        'target-profile-ids': [1, 2],
      };

      // when
      await httpTestServer.request('POST', '/api/admin/organizations/1/attach-target-profiles', payload);

      // then
      sinon.assert.calledOnce(organizationController.attachTargetProfiles);
    });

    it('should allow to controller if user has role METIER', async function () {
      // given
      sinon.stub(organizationController, 'attachTargetProfiles').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        'target-profile-ids': [1, 2],
      };

      // when
      await httpTestServer.request('POST', '/api/admin/organizations/1/attach-target-profiles', payload);

      // then
      sinon.assert.calledOnce(organizationController.attachTargetProfiles);
    });

    it('should return 403 without reaching controller if user has not an allowed role', async function () {
      // given
      sinon.stub(organizationController, 'attachTargetProfiles').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        'target-profile-ids': [1, 2],
      };

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/organizations/1/attach-target-profiles',
        payload,
      );

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(organizationController.attachTargetProfiles);
    });

    it('should return a 404 HTTP response when target-profile-ids do not contain only numbers', async function () {
      // given
      sinon.stub(organizationController, 'attachTargetProfiles').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        'target-profile-ids': ['a', 2],
      };

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/organizations/1/attach-target-profiles',
        payload,
      );

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.payload).to.have.string("L'id d'un des profils cible ou de l'organisation n'est pas valide");
    });

    it('should return a 404 HTTP response when organization id is not valid', async function () {
      // given
      sinon.stub(organizationController, 'attachTargetProfiles').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        'target-profile-ids': [1, 2],
      };

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/organizations/coucou/attach-target-profiles',
        payload,
      );

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.payload).to.have.string("L'id d'un des profils cible ou de l'organisation n'est pas valide");
    });
  });

  describe('GET /api/admin/organizations/{id}/target-profile-summaries', function () {
    it('should allow to controller if user has role SUPER_ADMIN', async function () {
      // given
      sinon.stub(organizationController, 'findTargetProfileSummariesForAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      sinon.assert.calledOnce(organizationController.findTargetProfileSummariesForAdmin);
    });

    it('should allow to controller if user has role SUPPORT', async function () {
      // given
      sinon.stub(organizationController, 'findTargetProfileSummariesForAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      sinon.assert.calledOnce(organizationController.findTargetProfileSummariesForAdmin);
    });

    it('should allow to controller if user has role METIER', async function () {
      // given
      sinon.stub(organizationController, 'findTargetProfileSummariesForAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      sinon.assert.calledOnce(organizationController.findTargetProfileSummariesForAdmin);
    });

    it('should return 403 without reaching controller if user has not an allowed role', async function () {
      // given
      sinon.stub(organizationController, 'findTargetProfileSummariesForAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(organizationController.findTargetProfileSummariesForAdmin);
    });

    it('should return a 400 HTTP response when organization id is not valid', async function () {
      // given
      sinon.stub(organizationController, 'findTargetProfileSummariesForAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/organizations/coucou/target-profile-summaries');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/organizations/{id}/invitations', function () {
    const method = 'POST';
    const url = '/api/organizations/1/invitations';

    it('should return HTTP code 201', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should accept multiple emails', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org, user2@organization.org',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should reject request with HTTP code 400, when email is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: '',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when input is not a email', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'azerty',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should check if user is admin in organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').resolves(false);
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
          },
        },
      };

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(securityPreHandlers.checkUserIsAdminInOrganization).to.have.be.called;
    });
  });

  describe('POST /api/admin/organizations/{id}/invitations', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/1/invitations';

    it('should return HTTP code 201', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(organizationController, 'sendInvitationByLangAndRole')
        .callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            lang: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should reject request with HTTP code 400, when email is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: '',
            lang: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when input is not a email', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'azerty',
            lang: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when lang is unknown', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            lang: 'pt',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            lang: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/organizations/{id}/invitations', function () {
    it('should return an empty list when no organization is found', async function () {
      // given
      sinon.stub(usecases, 'findPendingOrganizationInvitations').resolves([]);
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/organizations/1/invitations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([]);
    });
  });

  describe('GET /api/organizations/{id}/sup-organization-learners/csv-template', function () {
    let httpTestServer;

    beforeEach(async function () {
      sinon
        .stub(organizationController, 'getOrganizationLearnersCsvTemplate')
        .callsFake((request, h) => h.response('ok').code(200));

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    it('should call the organization controller to csv template', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/sup-organization-learners/csv-template?accessToken=token';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.getOrganizationLearnersCsvTemplate).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', function () {
      it('should throw an error when id is not a number', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/ABC/sup-organization-learners/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when id is null', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/null/sup-organization-learners/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when access token is not specified', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/sup-organization-learners/csv-template';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/organizations/{id}/sco-organization-learners/import-siecle', function () {
    it('should call the organization controller to import organizationLearners', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/1/sco-organization-learners/import-siecle';
      const payload = {};

      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents')
        .callsFake((request, h) => h.response(true));
      sinon
        .stub(organizationController, 'importOrganizationLearnersFromSIECLE')
        .callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organizationController.importOrganizationLearnersFromSIECLE).to.have.been.calledOnce;
    });

    it('should throw an error when id is invalid', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/wrongId/sco-organization-learners/import-siecle';
      const payload = {};

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('DELETE /api/organizations/{id}/invitations/{invitationId}', function () {
    it('should call the cancel organization invitation controller', async function () {
      // given
      sinon
        .stub(organizationController, 'cancelOrganizationInvitation')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'DELETE';
      const url = '/api/organizations/1/invitations/1';

      // when
      await httpTestServer.request(method, url);

      // then
      expect(securityPreHandlers.checkUserIsAdminInOrganization).to.have.be.called;
      expect(organizationController.cancelOrganizationInvitation).to.have.been.calledOnce;
    });
  });
});
