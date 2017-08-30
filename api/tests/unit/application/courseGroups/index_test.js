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

  describe('GET /api/courseGroups', function() {

    before(function() {
      sinon.stub(courseGroupController, 'list').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      courseGroupController.list.restore();
    });

    it('should exist', function(done) {
      server.inject({ method: 'GET', url: '/api/course-groups' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });
});
