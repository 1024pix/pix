const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const moduleUnderTest = require('../../../../lib/application/courses');

const courseController = require('../../../../lib/application/courses/course-controller');

describe('Unit | Router | course-router', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(courseController, 'get').returns('ok');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/courses/{id}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/courses/course_id');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
