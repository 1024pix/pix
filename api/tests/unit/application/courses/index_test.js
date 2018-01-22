const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const CourseController = require('../../../../lib/application/courses/course-controller');

const connectedUserVerification = require('../../../../lib/application/preHandlers/connected-user-verification');
const accessSessionHandler = require('../../../../lib/application/preHandlers/access-session');

describe('Unit | Router | course-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courses') });
  });

  function expectRouteToExist(routeOptions, done) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
      done();
    });
  }

  describe('GET /api/courses', function() {

    before(function() {
      sinon.stub(CourseController, 'list').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      CourseController.list.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/courses' }, done);
    });
  });

  describe('GET /api/courses/{id}', function() {

    before(function() {
      sinon.stub(CourseController, 'get').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      CourseController.get.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'GET', url: '/api/courses/course_id' }, done);
    });
  });

  describe('POST /api/courses/{id}', function() {

    before(function() {
      sinon.stub(CourseController, 'refresh').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      CourseController.refresh.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'POST', url: '/api/courses/course_id' }, done);
    });
  });

  describe('PUT /api/courses', function() {

    before(function() {
      sinon.stub(CourseController, 'refreshAll').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      CourseController.refreshAll.restore();
    });

    it('should exist', function(done) {
      expectRouteToExist({ method: 'PUT', url: '/api/courses' }, done);
    });
  });

  describe('POST /api/courses', function() {

    let sandbox;

    before(() => {
      sandbox = sinon.sandbox.create();

      sandbox.stub(connectedUserVerification, 'verifyByToken').callsFake((request, reply) => reply('decodedToken'));
      sandbox.stub(accessSessionHandler, 'sessionIsOpened').callsFake((request, reply) => reply('decodedToken'));
      sandbox.stub(CourseController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      sandbox.restore();
    });

    it('should exist', (done) => {
      expectRouteToExist({ method: 'POST', url: '/api/courses' }, done);
    });

    it('should verify if user is connected and the certification session code is right', (done) => {
      server.inject({ method: 'POST', url: '/api/courses' }, () => {
        expect(connectedUserVerification.verifyByToken).to.have.been.called;
        expect(accessSessionHandler.sessionIsOpened).to.have.been.called;
        done();
      });
    });
  });
});
