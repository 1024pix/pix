const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const organizationController = require('../../../../lib/application/organizations/organization-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/organizations'));
}

describe('Unit | Router | organization-router', () => {

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserIsOwnerInOrganization').returns(true);
    sinon.stub(organizationController, 'find').returns('ok');
    sinon.stub(organizationController, 'sendInvitation').callsFake((request, h) => h.response().created());

    startServer();
  });

  describe('GET /api/organizations', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/organizations?name=DRA&code=AZ&type=SCO&page=3&pageSize=25',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /api/organizations/{id}/invitations', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/organizations/1/invitations'
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

});
