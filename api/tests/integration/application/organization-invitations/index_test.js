const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const organisationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');
const route = require('../../../../lib/application/organization-invitations/index');

describe('Integration | Application | Organization-invitations | Routes', () => {

  let server;

  beforeEach(() => {
    server = Hapi.server();
  });

  describe('POST /api/organization-invitations/:id/response', () => {

    beforeEach(async () => {
      sinon.stub(organisationInvitationController, 'acceptOrganizationInvitation').callsFake((request, h) => h.response().code(204));
      await server.register(route);
    });

    it('should return 200 when payload is valid', async () => {

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
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 400 when payload is missing', async () => {
      // when
      const response = await server.inject({ method: 'POST', url: '/api/organization-invitations/1/response' });

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/organization-invitations/sco', () => {

    beforeEach(async () => {
      sinon.stub(organisationInvitationController, 'sendScoInvitation').callsFake((request, h) => h.response().code(201));
      await server.register(route);
    });

    it('should send invitation when payload is valid', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/organization-invitations/sco',
        payload: {
          data: {
            type: 'sco-organization-invitations',
            attributes: {
              uai: '1234567A',
              'first-name': 'john',
              'last-name': 'harry',
            },
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return bad request when payload is not valid', async () => {

      // given
      const options = {
        method: 'POST',
        url: '/api/organization-invitations/sco',
        payload: {
          data: {
            type: 'sco-organization-invitations',
            attributes: {
              uai: '1234567A',
              lastName: 'harry',
            },
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });

  });

  describe('GET /api/organization-invitations/:id', () => {

    beforeEach(async () => {
      sinon.stub(organisationInvitationController, 'getOrganizationInvitation').callsFake((request, h) => h.response().code(200));
      await server.register(route);
    });

    it('should return 200 when query is valid', async () => {
      // when
      const response = await server.inject({ method: 'GET', url: '/api/organization-invitations/1?code=DZWMP7L5UM' });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 when query is invalid', async () => {
      // when
      const response = await server.inject({ method: 'GET', url: '/api/organization-invitations/1' });

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

});
