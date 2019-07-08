const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const passwordController = require('../../../../lib/application/passwords/password-controller');

describe('Unit | Router | Password router', () => {

  let server;

  beforeEach(() => {
    // server dependencies must be stubbed before server registration
    sinon.stub(passwordController, 'createPasswordResetDemand');
    sinon.stub(passwordController, 'createPasswordReset');

    server = Hapi.server();
    return server.register(require('../../../../lib/application/passwords'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/password-reset-demands', () => {

    it('should exist', async () => {
      // given
      passwordController.createPasswordResetDemand.returns('ok');

      const options = {
        method: 'POST',
        url: '/api/password-reset-demands',
        payload: {
          data: {
            attributes: {
              email: 'uzinagaz@unknown.xh',
              'temporary-key': 'clé',
            },
            type: 'password-reset-demand',
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/password-resets', () => {

    it('should exist', async () => {
      // given
      passwordController.createPasswordReset.returns('ok');

      const options = {
        method: 'POST',
        url: '/api/password-resets',
        payload: {
          data: {
            attributes: {
              'temporary-key': 'clé',
              password: 'password',
            },
            type: 'password-reset',
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
