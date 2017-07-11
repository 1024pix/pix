const { describe, it, expect, before, after, beforeEach, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const FollowerController = require('../../../../lib/application/followers/follower-controller');

describe('Unit | Router | FollowerRouter', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/followers') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('POST /api/followers', function() {

    before(function() {
      sinon.stub(FollowerController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      FollowerController.save.restore();
    });

    it('should exist', function(done) {
      return expectRouteToExist({ method: 'POST', url: '/api/followers' }, done);
    });
  });

});
