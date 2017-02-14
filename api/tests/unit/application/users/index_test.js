const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const UserController = require('../../../../lib/application/users/user-controller');

describe('Unit | Router | user-outer', function () {

  let server;

  beforeEach(function () {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/users') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api/users', function () {

    before(function () {
      sinon.stub(UserController, 'list', (request, reply) => reply('ok'));
    });

    after(function () {
      UserController.list.restore();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'GET', url: '/api/users' }, done);
    });
  });

  describe('GET /api/users/{id}', function () {

    before(function () {
      sinon.stub(UserController, 'get', (request, reply) => reply('ok'));
    });

    after(function () {
      UserController.get.restore();
    });

    it('should exist', function (done) {
      expectRouteToExist({ method: 'GET', url: '/api/users/user_id' }, done);
    });
  });

  describe('POST /api/users', function () {

    before(function () {
      sinon.stub(UserController, 'save', (request, reply) => reply('ok'));
    });

    after(function () {
      UserController.save.restore();
    });

    it('should exist', function (done) {
      return expectRouteToExist({ method: 'POST', url: '/api/users' }, done);
    });
  });

});
