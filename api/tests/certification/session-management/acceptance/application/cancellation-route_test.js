import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Session-management | Acceptance | Application | Routes | cancellation', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/cancel', function () {
    it('should respond with a 204', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      const options = {
        method: 'PATCH',
        url: '/api/admin/certification-courses/123/cancel',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/uncancel', function () {
    it('should respond with a 204', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      const options = {
        method: 'PATCH',
        url: '/api/admin/certification-courses/123/uncancel',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
