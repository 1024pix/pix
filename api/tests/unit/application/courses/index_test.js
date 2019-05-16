const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const courseController = require('../../../../lib/application/courses/course-controller');

describe('Integration | Router | course-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(courseController, 'list').returns('ok');
    sinon.stub(courseController, 'get').returns('ok');
    sinon.stub(courseController, 'save').returns('ok');
    sinon.stub(courseController, 'retrieveOrCreateCertificationCourseFromKnowledgeElements').returns('ok');

    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/courses'));
  });

  describe('GET /api/courses', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/courses/{id}', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses/course_id'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /api/courses', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/courses'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /api/courses-v2s', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/courses-v2s'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });
});
