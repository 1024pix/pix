const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const courseController = require('../../../../lib/application/courses/course-controller');

describe('Integration | Router | course-router', () => {

  let sandbox;
  let server;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sandbox.stub(courseController, 'list').returns('ok');
    sandbox.stub(courseController, 'get').returns('ok');
    sandbox.stub(courseController, 'save').returns('ok');

    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/courses'));
  });

  afterEach(() => {
    sandbox.restore();
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
});
