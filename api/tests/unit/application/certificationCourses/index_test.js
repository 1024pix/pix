const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const certificationCourseController = require('../../../../lib/application/certificationCourses/certification-course-controller');
const connectedUserVerification = require('../../../../lib/application/preHandlers/connected-user-verification');
const accessSessionHandler = require('../../../../lib/application/preHandlers/access-session');

describe('Unit | Router | certification-course-router', function() {

  let server;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(connectedUserVerification, 'verifyByToken').callsFake((request, reply) => reply('decodedToken'));
    sandbox.stub(accessSessionHandler, 'sessionIsOpened').callsFake((request, reply) => reply('decodedToken'));
    sandbox.stub(certificationCourseController, 'save').callsFake((request, reply) => reply('ok'));
  });

  afterEach(() => sandbox.restore());

  describe('POST /api/certification-course', function() {

    beforeEach(function() {
      server = this.server = new Hapi.Server();
      server.connection({ port: null });
      server.register({ register: require('../../../../lib/application/certificationCourses') });
    });

    it('should exist', function(done) {
      server.inject({ method: 'POST', url: '/api/certification-courses' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('should call pre-handler', (done) => {
      return server.inject({ method: 'POST', url: '/api/certification-courses' }, () => {
        expect(connectedUserVerification.verifyByToken).to.have.been.called;
        expect(accessSessionHandler.sessionIsOpened).to.have.been.called;
        done();
      });
    });
  });
});
