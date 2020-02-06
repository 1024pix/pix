const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const organisationController = require('../../../../lib/application/organizations/organization-controller');
const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Integration | Application | Organizations | Routes', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(securityController, 'checkUserIsAdminInScoOrganizationAndManagesStudents').callsFake((request, h) => h.response(true));
    sinon.stub(securityController, 'checkUserIsAdminInOrganizationOrHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(securityController, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));

    sinon.stub(organisationController, 'create').returns('ok');
    sinon.stub(organisationController, 'findPaginatedFilteredOrganizations').returns('ok');
    sinon.stub(organisationController, 'findPaginatedFilteredCampaigns').returns('ok');
    sinon.stub(organisationController, 'importStudentsFromSIECLE').callsFake((request, h) => h.response('ok').code(201));
    sinon.stub(organisationController, 'sendInvitations').callsFake((request, h) => h.response().created());
    sinon.stub(organisationController, 'findPendingInvitations').returns('ok');

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
      expect(organisationController.findPaginatedFilteredCampaigns).to.have.been.calledOnce;
    });
  });

  describe('POST /api/organizations/:id/import-students', () => {

    it('should call the organization controller to import students', async () => {
      // given
      const method = 'POST';
      const url = '/api/organizations/:id/import-students';
      const payload = {};

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organisationController.importStudentsFromSIECLE).to.have.been.calledOnce;
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
            email: 'member@organization.org'
          },
        }
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organisationController.sendInvitations).to.have.been.calledOnce;
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
      expect(organisationController.findPendingInvitations).to.have.been.calledOnce;
    });
  });

});
