const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | Routes', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganizationOrHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
    sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganizationManagingStudents').callsFake((request, h) => h.response(true));
    sinon.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents').callsFake((request, h) => h.response(true));
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents').callsFake((request, h) => h.response(true));

    sinon.stub(organizationController, 'create').returns('ok');
    sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
    sinon.stub(organizationController, 'findPaginatedFilteredCampaigns').returns('ok');
    sinon.stub(organizationController, 'importSchoolingRegistrationsFromSIECLE').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
    sinon.stub(organizationController, 'findPendingInvitations').returns('ok');
    sinon.stub(organizationController, 'findPaginatedFilteredSchoolingRegistrations').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(organizationController, 'attachTargetProfiles').callsFake((request, h) => h.response('ok').code(204));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/organizations', () => {

    it('should exist', async () => {
      // given
      const method = 'POST';
      const url = '/api/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/organizations', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/organizations/:id/campaigns', () => {

    it('should call the organization controller to get the campaigns', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations/:id/campaigns';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPaginatedFilteredCampaigns).to.have.been.calledOnce;
    });
  });

  describe('POST /api/organizations/:id/schooling-registrations/import-siecle', () => {

    it('should call the organization controller to import schoolingRegistrations', async () => {
      // given
      const method = 'POST';
      const url = '/api/organizations/1/schooling-registrations/import-siecle';
      const payload = {};

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organizationController.importSchoolingRegistrationsFromSIECLE).to.have.been.calledOnce;
    });

    it('should throw an error when id is invalid', async () => {
      // given
      const method = 'POST';
      const url = '/api/organizations/wrongId/schooling-registrations/import-siecle';
      const payload = {};

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/organizations/:id/invitations', () => {

    it('should call the organization controller to send invitations', async () => {
      // given
      const method = 'POST';
      const url = '/api/organizations/:id/invitations';
      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'member@organization.org',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organizationController.sendInvitations).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id/invitations', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations/:id/invitations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPendingInvitations).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id/students', () => {

    it('should call the organization controller to return students', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/students';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', () => {

      it('should throw an error when page size is invalid', async () => {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/students?page[size]=blabla';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when page number is invalid', async () => {
        // given
        const method = 'GET';
        const url = '/api/organizations/1/students?page[number]=blabla';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when id is invalid', async () => {
        // given
        const method = 'GET';
        const url = '/api/organizations/wrongId/students';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/organizations/:id/target-profiles', () => {

    it('should resolve with a 204 status code', async () => {
      // given
      const method = 'POST';
      const url = '/api/organizations/:id/target-profiles';
      const payload = {
        data: {
          type: 'target-profile-shares',
          attributes: {
            'target-profiles-to-attach': [1, 2],
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
