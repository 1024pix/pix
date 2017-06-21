const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const courseGroupController = require('../../../../lib/application/courseGroups/course-group-controller');

describe('Unit | Router | course-group-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courseGroups') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api/courseGroups', function() {

    before(function() {
      sinon.stub(courseGroupController, 'list', (request, reply) => reply('ok'));
    });

    after(function() {
      courseGroupController.list.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/course-groups' }, done);
    });
  });
});
