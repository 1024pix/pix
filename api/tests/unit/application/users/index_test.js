const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const userVerification = require('../../../../lib/application/preHandlers/user-existence-verification');
const userController = require('../../../../lib/application/users/user-controller');

const moduleUnderTest = require('../../../../lib/application/users');

let httpTestServer;

function startServer() {
  return new HttpTestServer(moduleUnderTest);
}

describe('Unit | Router | user-router', () => {

  describe('GET /api/users', () => {

    const method = 'GET';

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'findPaginatedFilteredUsers').returns('ok');
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // given
      const url = '/api/users?firstName=Bruce&lastName=Wayne&email=batman@gotham.city&page=3&pageSize=25';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/users', () => {

    const method = 'POST';
    const url = '/api/users';

    beforeEach(() => {
      sinon.stub(userController, 'save').returns('ok');
      httpTestServer = startServer();
    });

    context('Payload schema validation', () => {

      it('should return HTTP 400 if payload does not exist', async () => {
        // given
        const payload = null;

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return HTTP 200 if payload is not empty and valid', async () => {
        // given
        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/me', function() {

    const method = 'GET';

    beforeEach(() => {
      sinon.stub(userController, 'getCurrentUser').returns('ok');
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // given
      const url = '/api/users/me';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/users/{id}/memberships', function() {

    const method = 'GET';

    beforeEach(() => {
      sinon.stub(userController, 'getMemberships').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // given
      const url = '/api/users/12/memberships';

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.getMemberships);
    });
  });

  describe('PATCH /api/users/{id}/password-update', function() {

    const method = 'PATCH';
    const url = '/api/users/12344/password-update';

    beforeEach(() => {
      sinon.stub(userController, 'updatePassword').returns('ok');
      sinon.stub(userVerification, 'verifyById').returns('ok');
      httpTestServer = startServer();
    });

    it('should exist and pass through user verification pre-handler', async () => {
      // given
      const payloadAttributes = { password: 'Pix2019!' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(userVerification.verifyById);
    });

    describe('Payload schema validation', () => {

      it('should have a payload', async () => {
        // when
        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should have a password attribute in payload', async () => {
        // given
        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      describe('password validation', () => {

        it('should have a valid password format in payload', async () => {
          // given
          const payloadAttributes = {
            password: 'Mot de passe mal formé',
          };
          const payload = { data: { attributes: payloadAttributes } };

          // when
          const result = await httpTestServer.request(method, url, payload);

          // then
          expect(result.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('GET /api/users/{id}/is-certifiable', function() {

    const method = 'GET';
    const url = '/api/users/42/is-certifiable';

    beforeEach(() => {
      sinon.stub(userController, 'isCertifiable').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.isCertifiable);
    });
  });

  describe('GET /api/users/{id}/profile', function() {

    const method = 'GET';
    const url = '/api/users/42/profile';

    beforeEach(() => {
      sinon.stub(userController, 'getProfile').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.getProfile);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/profile', function() {

    const method = 'GET';

    beforeEach(() => {
      sinon.stub(userController, 'getUserProfileSharedForCampaign').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should return 200', async () => {
      // given
      const url = '/api/users/12/campaigns/34/profile';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async () => {
      // given
      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async () => {
      // given
      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/campaign-participations', function() {

    const method = 'GET';

    beforeEach(() => {
      sinon.stub(userController, 'getUserCampaignParticipationToCampaign').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should return 200', async () => {
      // given
      const url = '/api/users/12/campaigns/34/campaign-participations';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async () => {
      // given
      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/campaign-participations`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async () => {
      // given
      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/campaign-participations`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/users/{id}', function() {

    const method = 'PATCH';

    beforeEach(() => {
      sinon.stub(userController, 'updateUserDetailsForAdministration').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should verify user identity and return sucess update', async () => {
      // given
      const userId = '12344';
      const url = `/api/admin/users/${userId}`;
      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkUserHasRolePixMaster);
    });

    describe('Payload and path param schema validation', () => {

      const method = 'PATCH';
      const url = '/api/admin/users/not_number';

      it('should return bad request when param id is not numeric', async () => {
        // given
        const payload = { data: { attributes: { email: 'partial@update.net' } } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return bad request when payload is not found', async () => {
        // when
        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/admin/users/{id}/anonymize', () => {

    const method = 'POST';

    beforeEach(() => {
      sinon.stub(userController, 'anonymizeUser').callsFake((request, h) => h.response({}).code(204));
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // given
      const url = '/api/admin/users/1/anonymize';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(204);
    });

    it('should return 400 when id is not a number', async () => {
      // given
      const url = '/api/admin/users/wrongId/anonymize';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
      expect(JSON.parse(result.payload).errors[0].detail).to.equal('"id" must be a number');
    });
  });

  describe('PATCH /api/admin/users/{id}/dissociate', () => {

    const method = 'PATCH';

    beforeEach(() => {
      sinon.stub(userController, 'dissociateSchoolingRegistrations').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // given
      const url = '/api/admin/users/1/dissociate';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when id is not a number', async () => {
      // given
      const url = '/api/admin/users/wrongId/dissociate';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
      expect(JSON.parse(result.payload).errors[0].detail).to.equal('"id" must be a number');
    });
  });

  describe('POST /api/admin/users/{id}/remove-authentication', () => {

    beforeEach(() => {
      sinon.stub(userController, 'removeAuthenticationMethod').returns('ok');
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      httpTestServer = startServer();
    });

    ['GAR', 'EMAIL', 'USERNAME', 'POLE_EMPLOI']
      .forEach((type) => {
        it(`should return 200 when type is ${type}`, async () => {
          // given
          const url = '/api/admin/users/1/remove-authentication';
          const payload = {
            data: {
              attributes: {
                type,
              },
            },
          };

          // when
          const result = await httpTestServer.request('POST', url, payload);

          // then
          expect(result.statusCode).to.equal(200);
        });
      });

    it('should return 400 when id is not a number', async () => {
      // given
      const url = '/api/admin/users/wrongId/remove-authentication';
      const payload = {
        data: {
          attributes: {
            type: 'EMAIL',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when type is not GAR or EMAIL or USERNAME or POLE_EMPLOI', async () => {
      // given
      const url = '/api/admin/users/1/remove-authentication';
      const payload = {
        data: {
          attributes: {
            type: 'INVALID',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });
});
