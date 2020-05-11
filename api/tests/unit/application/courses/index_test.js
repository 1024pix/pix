const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityController = require('../../../../lib/application/security-controller');
const courseController = require('../../../../lib/application/courses/course-controller');

describe('Integration | Router | course-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(courseController, 'get').returns('ok');

    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/courses'));
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
});
