const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | Routes', function () {
  describe('POST /api/admin/organizations', function () {
    it('should exist', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/organizations';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'create').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/organizations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          const method = 'GET';
          const url = '/api/admin/organizations';

          sinon
            .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
            .returns((request, h) => h.response().code(403).takeover());
          sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('POST /api/admin/organizations/:id/archive', function () {
    it('should call the controller to archive the organization', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/organizations/1/archive';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'archiveOrganization').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(204);
      expect(organizationController.archiveOrganization).to.have.been.calledOnce;
    });
  });

  describe('GET /api/admin/organizations/:id/places', function () {
    it('should call the controller to archive the organization', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/places';

      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(organizationController, 'findOrganizationPlacesLot')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findOrganizationPlacesLot).to.have.been.calledOnce;
    });
  });

  describe('GET /api/admin/organizations/:id/invitations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/invitations';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'findPendingInvitations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPendingInvitations).to.have.been.calledOnce;
    });
  });

  describe('POST /api/admin/organizations/:id/target-profiles', function () {
    it('should resolve with a 204 status code', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/organizations/1/target-profiles';
      const payload = {
        data: {
          type: 'target-profile-shares',
          attributes: {
            'target-profiles-to-attach': [1, 2],
          },
        },
      };

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'attachTargetProfiles').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/organizations/:id/campaigns', function () {
    it('should call the organization controller to get the campaigns', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/campaigns';

      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'findPaginatedFilteredCampaigns').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPaginatedFilteredCampaigns).to.have.been.calledOnce;
    });
  });

  describe('POST /api/organizations/:id/invitations', function () {
    it('should call the organization controller to send invitations', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/1/invitations';
      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'member@organization.org',
          },
        },
      };

      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organizationController.sendInvitations).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id/invitations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/invitations';

      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'findPendingInvitations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPendingInvitations).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id/students', function () {
    it('should call the organization controller to return students', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/students';

      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToOrganizationManagingStudents')
        .callsFake((request, h) => h.response(true));
      sinon
        .stub(organizationController, 'findPaginatedFilteredOrganizationLearners')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPaginatedFilteredOrganizationLearners).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', function () {
      it('should throw an error when page size is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/students?page[size]=blabla';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when page number is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/students?page[number]=blabla';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when id is invalid', async function () {
        // given
        const method = 'GET';
        const url = '/api/organizations/wrongId/students';

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/organizations/{id}/participants', function () {
    const method = 'GET';
    const url = '/api/organizations/1/participants';

    it('should return HTTP code 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').returns(true);

      sinon
        .stub(organizationController, 'getPaginatedParticipantsForAnOrganization')
        .callsFake((request, h) => h.response('ok').code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            id: '1',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.getPaginatedParticipantsForAnOrganization).to.have.been.calledOnce;
    });

    it('should return HTTP code 400 when user not belongs to the organization', async function () {
      //given
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
        .callsFake((request, h) => h.response('ko').code(403).takeover());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-participants',
          attributes: {
            id: '1',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('returns an error 400 when the organization id is not valid', async function () {
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', `/api/organizations/ABC/participants`);

      expect(response.statusCode).to.equal(400);
    });
  });
});
