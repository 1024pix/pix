const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | Routes', function () {
  describe('POST /api/organizations', function () {
    it('should exist', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations';

      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'create').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/organizations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations';

      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
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

  describe('POST /api/organizations/:id/schooling-registrations/import-siecle', function () {
    it('should call the organization controller to import schoolingRegistrations', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/1/schooling-registrations/import-siecle';
      const payload = {};

      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents')
        .callsFake((request, h) => h.response(true));
      sinon
        .stub(organizationController, 'importSchoolingRegistrationsFromSIECLE')
        .callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organizationController.importSchoolingRegistrationsFromSIECLE).to.have.been.calledOnce;
    });

    it('should throw an error when id is invalid', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/wrongId/schooling-registrations/import-siecle';
      const payload = {};

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
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

  describe('GET /api/admin/organizations/:id/invitations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/invitations';

      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
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
        .stub(organizationController, 'findPaginatedFilteredSchoolingRegistrations')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledOnce;
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

  describe('POST /api/organizations/:id/target-profiles', function () {
    it('should resolve with a 204 status code', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/1/target-profiles';
      const payload = {
        data: {
          type: 'target-profile-shares',
          attributes: {
            'target-profiles-to-attach': [1, 2],
          },
        },
      };

      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'attachTargetProfiles').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
