const { describe, it, after, before, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const certificationCourseController = require('../../../../lib/application/certificationCourses/certification-course-controller');
const connectedUserVerification = require('../../../../lib/application/preHandlers/connected-user-verification');

describe('Unit | Router | certification-course-router', function() {

  let server;

  beforeEach(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/certificationCourses') });
  });

  describe('POST /api/certification-course', function() {

    before(function() {
      sinon.stub(connectedUserVerification, 'verifyByToken').callsFake((request, reply) => reply('decodedToken'));
      sinon.stub(certificationCourseController, 'save').callsFake((request, reply) => reply('ok'));
    });

    after(function() {
      connectedUserVerification.verifyByToken.restore();
      certificationCourseController.save.restore();
    });

    it('should exist', function(done) {
      server.inject({ method: 'POST', url: '/api/certification-courses' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('should call pre-handler', (done) => {
      return server.inject({ method: 'POST', url: '/api/certification-courses' }, () => {
        sinon.assert.called(connectedUserVerification.verifyByToken);
        done();
      });
    });
  });

});
