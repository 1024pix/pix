import { expect, sinon, HttpTestServer } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/passwords';
import passwordController from '../../../../lib/application/passwords/password-controller';

describe('Integration | Application | Password | Routes', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(passwordController, 'checkResetDemand').resolves('ok');
    sinon.stub(passwordController, 'createResetDemand').callsFake((request, h) => h.response().created());
    sinon.stub(passwordController, 'updateExpiredPassword').callsFake((request, h) => h.response().created());

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/password-reset-demands', function () {
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

    it('should return 201 http status code', async function () {
      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function () {
    const method = 'GET';
    const url = '/api/password-reset-demands/ABCDEF123';

    it('should return 200 http status code', async function () {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/expired-password-updates', function () {
    it('should return 201 http status code', async function () {
      // given
      const method = 'POST';
      const url = '/api/expired-password-updates';
      const payload = {
        data: {
          attributes: {
            'password-reset-token': 'PASSWORD_RESET_TOKEN',
            'new-password': 'Password123',
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
