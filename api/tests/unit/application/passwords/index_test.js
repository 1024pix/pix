import { expect, HttpTestServer, sinon } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/passwords';
import passwordController from '../../../../lib/application/passwords/password-controller';

describe('Unit | Router | Password router', function () {
  describe('POST /api/password-reset-demands', function () {
    const method = 'POST';
    const url = '/api/password-reset-demands';

    it('should return 200 http status code', async function () {
      // given
      sinon.stub(passwordController, 'createResetDemand').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          attributes: {
            email: 'uzinagaz@example.net',
            'temporary-key': 'clé',
          },
          type: 'password-reset',
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('When payload has a bad format or no email is provided', function () {
      it('should return 400 http status code', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {},
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/password-reset-demands/{temporaryKey}', function () {
    const method = 'GET';
    const url = '/api/password-reset-demands/ABCDEF123';

    it('should return 201 http status code', async function () {
      // given
      sinon.stub(passwordController, 'checkResetDemand').resolves('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/expired-password-updates', function () {
    const method = 'POST';
    const url = '/api/expired-password-updates';

    it('should return 201 http status code', async function () {
      // given
      sinon.stub(passwordController, 'updateExpiredPassword').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

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

    context('When the payload has the wrong format or no passwordResetToken or newPassword is provided.', function () {
      it('should return 400 http status code', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          data: {
            attributes: {
              'password-reset-token': 'PASSWORD_RESET_TOKEN',
              newPassword: null,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
