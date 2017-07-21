const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const AuthenticationController = require('../../../../lib/application/authentication/authentication-controller');

describe('Unit | Router | authentication-router', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/authentication') });
  });

  describe('POST /api/authentications', () => {

    before(() => {
      sinon.stub(AuthenticationController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      AuthenticationController.save.restore();
    });

    it('should exist', (done) => {
      return server.inject({ method: 'POST', url: '/api/authentications' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

});
