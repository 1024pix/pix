const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const usecases = require ('../../../../lib/domain/usecases');

const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Unit | Router | organization-router', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'findPendingOrganizationInvitations').resolves([]);

    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganizationOrHasRolePixMaster').returns(true);
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').returns(true);

    sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
    sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/organizations', () => {

    it('should exist', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations?filter[name]=DRA&filter[type]=AZ&filter[type]=SCO&page[number]=3&page[size]=25';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/organizations/{id}/invitations', () => {

    const method = 'POST';
    const url = '/api/organizations/1/invitations';
    let payload;

    beforeEach(() => {
      payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org'
          },
        }
      };
    });

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should accept multiple emails', async () => {
      // given
      payload.data.attributes.email = 'user1@organization.org, user2@organization.org';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should reject request with HTTP code 400, when email is empty', async () => {
      // given
      payload.data.attributes.email = '';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when input is not a email', async () => {
      // given
      payload.data.attributes.email = 'azerty';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/organizations/{id}/invitations', () => {

    it('should return an empty list when no organization is found', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/invitations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([]);
    });
  });

});
