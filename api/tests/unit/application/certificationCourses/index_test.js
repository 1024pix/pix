const { describe, it, before, after, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const certificationCoursesController = require('../../../../lib/application/certificationCourses/certification-course-controller');

describe('Unit | Router | certification-course-router', function() {

  let server;

  beforeEach(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/certificationCourses') });
  });

  describe('GET /api/certification-courses/id/result', () => {

    before(() => {
      sinon.stub(certificationCoursesController, 'getResult').callsFake((request, reply) => reply('ok'));
    });

    after(() => {
      certificationCoursesController.getResult.restore();
    });

    it('should exist', (done) => {
      return server.inject({ method: 'GET', url: '/api/certification-courses/:id/result' }, (res) => {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });
});
