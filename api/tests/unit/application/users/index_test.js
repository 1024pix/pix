const Hapi = require('@hapi/hapi');

const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const userController = require('../../../../lib/application/users/user-controller');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');

const moduleUnderTest = require('../../../../lib/application/users');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/users'));
}

describe('Unit | Router | user-router', () => {

  describe('GET /api/users', () => {

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').callsFake((request, h) => {
        h.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'findPaginatedFilteredUsers').returns('ok');
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users?firstName=Bruce&lastName=Wayne&email=batman@gotham.city&page=3&pageSize=25',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /api/users', () => {

    beforeEach(() => {
      sinon.stub(userController, 'save').returns('ok');
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/users',
        payload: {
          data: {
            attributes: {
              'first-name': 'Edouard',
              'last-name': 'Doux',
              email: 'doux.doudou@example.net',
              password: 'password_1234',
            },
          },
        },
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/me', function() {

    beforeEach(() => {
      sinon.stub(userController, 'getCurrentUser').returns('ok');
      startServer();
    });

    it('should exist', () => {
      // given
      const options = { method: 'GET', url: '/api/users/me' };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/{id}/memberships', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getMemberships').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/12/memberships',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(userController.getMemberships);
      });
    });
  });

  describe('PATCH /api/users/{id}/password-update', function() {

    const userId = '12344';
    const request = (payloadAttributes) => ({
      method: 'PATCH',
      url: `/api/users/${userId}/password-update`,
      payload: { data: { attributes: payloadAttributes } },
    });

    beforeEach(() => {
      sinon.stub(userController, 'updatePassword').returns('ok');
      sinon.stub(userVerification, 'verifyById').returns('ok');
      startServer();
    });

    it('should exist and pass through user verification pre-handler', async () => {
      // given
      const payloadAttributes = { password: 'Pix2019!' };

      // when
      const result = await server.inject(request(payloadAttributes));

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(userVerification.verifyById);
    });

    describe('Payload schema validation', () => {

      it('should have a payload', async () => {
        // given
        const requestWithoutPayload = {
          method: 'PATCH',
          url: `/api/users/${userId}/password-update`,
        };

        // when
        const result = await server.inject(requestWithoutPayload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should have a password attribute in payload', async () => {
        // given
        const payloadAttributes = {};

        // when
        const result = await server.inject(request(payloadAttributes));

        // then
        expect(result.statusCode).to.equal(400);
      });

      describe('password validation', () => {

        it('should have a valid password format in payload', async () => {
          // given
          const payloadAttributes = {
            'password': 'Mot de passe mal formé',
          };

          // when
          const result = await server.inject(request(payloadAttributes));

          // then
          expect(result.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('GET /api/users/{id}/is-certifiable', function() {
    beforeEach(() => {
      sinon.stub(userController, 'isCertifiable').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/42/is-certifiable',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(userController.isCertifiable);
      });
    });
  });

  describe('GET /api/users/{id}/pixscore', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getPixScore').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/42/pixscore',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(userController.getPixScore);
      });
    });
  });

  describe('GET /api/users/{id}/scorecards', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getScorecards').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/42/scorecards',
      };

      // when
      return server.inject(options).then(() => {
        // then
        sinon.assert.calledOnce(userController.getScorecards);
      });
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/profile', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getUserProfileSharedForCampaign').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should return 200', async () => {
      // when
      const result = await server.inject({ method: 'GET', url: '/api/users/12/campaigns/34/profile' });

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async () => {
      // given
      const userId = 'wrongId';

      // when
      const result = await server.inject({ method: 'GET', url: `/api/users/${userId}/campaigns/34/profile` });

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async () => {
      // given
      const campaignId = 'wrongId';

      // when
      const result = await server.inject({ method: 'GET', url: `/api/users/12/campaigns/${campaignId}/profile` });

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/campaign-participations', function() {
    beforeEach(() => {
      sinon.stub(userController, 'getUserCampaignParticipationToCampaign').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should return 200', async () => {
      // when
      const result = await server.inject({ method: 'GET', url: '/api/users/12/campaigns/34/campaign-participations' });

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async () => {
      // given
      const userId = 'wrongId';

      // when
      const result = await server.inject({ method: 'GET', url: `/api/users/${userId}/campaigns/34/campaign-participations` });

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async () => {
      // given
      const campaignId = 'wrongId';

      // when
      const result = await server.inject({ method: 'GET', url: `/api/users/12/campaigns/${campaignId}/campaign-participations` });

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/users/{id}', function() {

    const userId = '12344';
    const request = (payloadAttributes) => ({
      method: 'PATCH',
      url: `/api/admin/users/${userId}`,
      payload: { data: { attributes: payloadAttributes } },
    });

    beforeEach(() => {
      sinon.stub(userController, 'updateUserDetailsForAdministration').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should verify user identity and return sucess update', async () => {
      // given
      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };

      // when
      const result = await server.inject(request(payloadAttributes));

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkUserHasRolePixMaster);
    });

    describe('Payload and path param schema validation', () => {

      it('should return bad request when param id is not numeric', async () => {
        // given
        const requestWithoutPayload = {
          method: 'PATCH',
          url: '/api/admin/users/not_number',
          payload: { data: { attributes: { email : 'partial@update.net' } } },
        };

        // when
        const result = await server.inject(requestWithoutPayload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return bad request when payload is not found', async () => {
        // given
        const requestWithoutPayload = {
          method: 'PATCH',
          url: '/api/admin/users/NOT_NUMBER',
        };

        // when
        const result = await server.inject(requestWithoutPayload);

        // then
        expect(result.statusCode).to.equal(400);
      });

    });
  });

  describe('POST /api/admin/users/{id}/anonymize', () => {

    beforeEach(() => {
      sinon.stub(userController, 'anonymizeUser').callsFake((request, h) => h.response({}).code(204));
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/admin/users/1/anonymize',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 400 when id is not a number', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/admin/users/wrongId/anonymize',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload).errors[0].detail).to.equal('"id" must be a number');
    });
  });

  describe('PATCH /api/users/{id}/authentication-methods/saml', () => {

    const method = 'PATCH';
    const payload = {
      data: {
        id: 1,
        type: 'external-users',
        attributes: {
          'external-user-token': 'TOKEN',
        },
      },
    };

    let url;
    let httpTestServer;

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'updateUserSamlId').returns('ok');

      httpTestServer = new HttpTestServer(moduleUnderTest);
    });

    it('should exist', async () => {
      // given
      url = '/api/users/1/authentication-methods/saml';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('Payload schema validation', () => {

      it('should have a valid userId', async () => {
        // given
        url = '/api/users/wrongId/authentication-methods/saml';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should have a payload', async () => {
        // given
        url = '/api/users/1/authentication-methods/saml';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should have an externalUserToken attribute in payload', async () => {
        // given
        url = '/api/users/1/authentication-methods/saml';
        payload.data.attributes['external-user-token'] = '';

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

  });

});
