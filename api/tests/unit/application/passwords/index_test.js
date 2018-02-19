const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const passwordController = require('../../../../lib/application/passwords/password-controller');

describe('Unit | Router | Password router', () => {

  let server;

  beforeEach(() => {
    // server dependencies must be stubbed before server registration
    sinon.stub(passwordController, 'createResetDemand');

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/passwords') });
  });

  afterEach(() => {
    passwordController.createResetDemand.restore();
    server.stop();
  });

  describe('POST /api/password-reset-demands', () => {

    it('should exist', () => {
      // given
      passwordController.createResetDemand.callsFake((request, reply) => {
        reply('ok');
      });

      const options = {
        method: 'POST',
        url: '/api/password-reset-demands',
        payload: {
          data: {
            attributes: {
              email: 'uzinagaz@unknown.xh',
              'temporary-key': 'clé'
            },
            type: 'password-reset'
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });

    describe('when payload has a bad format or no email is provided', () => {

      it('should reply with 400', () => {
        // given
        const options = {
          method: 'POST',
          url: '/api/password-reset-demands',
          payload: {
            data: {
              attributes: {}
            }
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(400);
          expect(response.statusMessage).to.equal('Bad Request');
        });
      });

    });

  });

});
