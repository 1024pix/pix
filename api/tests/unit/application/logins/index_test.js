const {describe, it, before, after, beforeEach, expect, sinon} = require('../../../test-helper');
const Hapi = require('hapi');
const LoginController = require('../../../../lib/application/logins/login-controller');

describe('Unit | Router | login-router', () => {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({port: null});
    server.register({register: require('../../../../lib/application/logins')});
  });

  describe('POST /api/logins', () => {

    before(() => {
      sinon.stub(LoginController, 'save', (request, reply) => reply('ok'));
    });

    after(() => {
      LoginController.save.restore();
    });

    it('should exist', (done) => {
      return server.inject({ method: 'POST', url: '/api/logins' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });

});
