const { expect, sinon, hFake } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/organization-invitations'));
}

describe('Unit | Router | organization-invitation-router', () => {

  beforeEach(() => {
    sinon.stub(organizationInvitationController, 'acceptOrganizationInvitation').callsFake((request, h) => h.response().code(204));
    sinon.stub(organizationInvitationController, 'getOrganizationInvitation').callsFake((request, h) => h.response().code(200));

    startServer();
  });

  describe('POST /api/organization-invitations/{id}/response', () => {

    it('should exists', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/organization-invitations/1/response',
        payload: {
          data: {
            id: '100047_DZWMP7L5UM',
            type: 'organization-invitation-responses',
            attributes: {
              code: 'DZWMP7L5UM',
              email: 'user@example.net'
            },

          }
        }
      };

      // when
      const response = await server.inject(options, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/organization-invitations/{id}', () => {

    it('should exists', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/organization-invitations/1?code=DZWMP7L5UM'
      };

      // when
      const response = await server.inject(options, hFake);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return Bad Request Error when invitation identifier is not a number', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/organization-invitations/XXXXXXXXXXXXXXXX15812?code=DZWMP7L5UM'
      };

      // when
      const response = await server.inject(options, hFake);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

});
