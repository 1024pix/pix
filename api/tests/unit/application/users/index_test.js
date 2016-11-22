const Hapi = require('hapi');
const UserController = require('../../../../lib/application/users/user-controller');

describe('Unit | Router | UserRouter', function () {

  let server;

  beforeEach(function () {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/users') });
  });

  function expectRouteToExist(routeOptions) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
    });
  }

  describe('GET /api/users', function () {

    before(function () {
      sinon.stub(UserController, 'list', (request, reply) => reply('ok'));
    });

    after(function () {
      UserController.list.restore();
    });

    it('should exist', function () {
      expectRouteToExist({ method: 'GET', url: '/api/users' });
    });
  });

  describe('GET /api/users/{id}', function () {

    before(function () {
      sinon.stub(UserController, 'get', (request, reply) => reply('ok'));
    });

    after(function () {
      UserController.get.restore();
    });

    it('should exist', function () {
      expectRouteToExist({ method: 'GET', url: '/api/users/user_id' });
    });
  });

  describe('POST /api/users/{id}', function () {

    before(function () {
      sinon.stub(UserController, 'save', (request, reply) => reply('ok'));
    });

    after(function () {
      UserController.save.restore();
    });

    it('should exist', function () {
      expectRouteToExist({ method: 'POST', url: '/api/users/user_id' });
    });
  });

});
