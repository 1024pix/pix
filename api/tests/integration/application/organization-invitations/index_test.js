const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const organisationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');
const route = require('../../../../lib/application/organization-invitations/index');

describe('Integration | Application | Organization-invitations | Routes', () => {

  let server;

  beforeEach(() => {
    server = Hapi.server();
  });

  describe('POST /api/organization-invitations/:id/response', () => {

    beforeEach(async () => {
      sinon.stub(organisationInvitationController, 'answerToOrganizationInvitation').callsFake((request, h) => h.response().code(204));
      await server.register(route);
    });

    it('should exist', async () => {
      // when
      const response = await server.inject({ method: 'POST', url: '/api/organization-invitations/1/response' });

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/organization-invitations/:id', () => {

    beforeEach(async () => {
      sinon.stub(organisationInvitationController, 'getOrganizationInvitation').callsFake((request, h) => h.response().code(200));
      await server.register(route);
    });

    it('should exist', async () => {
      // when
      const response = await server.inject({ method: 'GET', url: '/api/organization-invitations/1' });

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
