const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const UserController = require('../../../../lib/application/users/user-controller');

describe('Unit | Router | user-router', function () {

  let server;

  beforeEach(function () {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/users') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('POST /api/accounts', function () {

    before(function () {
      sinon.stub(UserController, 'save', (request, reply) => reply('ok'));
    });

    after(function () {
      UserController.save.restore();
    });

    it('should exist', function (done) {
      return expectRouteToExist({ method: 'POST', url: '/api/accounts' }, done);
    });
  });

});
