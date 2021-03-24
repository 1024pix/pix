const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/passwords');

const passwordController = require('../../../../lib/application/passwords/password-controller');

describe('Integration | Application | Password | Routes', function() {

  let httpTestServer;

  beforeEach(function() {
    sinon.stub(passwordController, 'checkResetDemand').resolves('ok');
    sinon.stub(passwordController, 'createResetDemand').callsFake((request, h) => h.response().created());
    sinon.stub(passwordController, 'updateExpiredPassword').callsFake((request, h) => h.response().created());

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/password-reset-demands', function() {

    const method = 'POST';
    const url = '/api/password-reset-demands';
    const headers = {
      'accept-language': 'fr',
    };
    const payload = {
      data: {
        type: 'password-reset-demands',
        attributes: { email: 'user@example.net' },
      },
    };

    it('should return 201 http status code', async function() {
      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function() {

    const method = 'GET';
    const url = '/api/password-reset-demands/ABCDEF123';

    it('should return 200 http status code', async function() {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

  });

  describe('POST /api/expired-password-updates', function() {

    it('should return 201 http status code', async function() {
      // given
      const method = 'POST';
      const url = '/api/expired-password-updates';
      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            username: 'firstName.lastName0512',
            expiredPassword: 'expiredPassword01',
            newPassword: 'newPassword02',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

});
