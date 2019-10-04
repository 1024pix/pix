const { expect, sinon, hFake } = require('../../../test-helper');
const Hapi = require('hapi');
const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/organization-invitations'));
}

describe('Unit | Router | organization-invitation-router', () => {

  beforeEach(() => {
    sinon.stub(organizationInvitationController, 'answerToOrganizationInvitation').callsFake((request, h) => h.response().code(204));

    startServer();
  });

  describe('POST /api/organization-invitations/{id}/response', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/organization-invitations/1/response'
      };

      // when
      const response = await server.inject(options, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

});
