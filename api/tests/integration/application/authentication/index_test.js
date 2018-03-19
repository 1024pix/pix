const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const authenticationController = require('../../../../lib/application/authentication/authentication-controller');

describe('Integration | Application | Route | AuthenticationRouter', () => {

  let server;

  beforeEach(() => {
    // stub dependencies
    sinon.stub(authenticationController, 'save').callsFake((request, reply) => reply('ok'));

    // configure and start server
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/authentication') });
  });

  afterEach(() => {
    server.stop();
    authenticationController.save.restore();
  });

  describe('POST /api/authentications', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/authentications'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

});
