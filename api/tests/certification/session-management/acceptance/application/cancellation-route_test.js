import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Session-management | Acceptance | cancellation-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/certification-courses/{id}/cancel', function () {
    it('should respond with a 200', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      const options = {
        method: 'POST',
        url: '/api/admin/certification-courses/123/cancel',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/certification-courses/{id}/uncancel', function () {
    it('should respond with a 200', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      const options = {
        method: 'POST',
        url: '/api/admin/certification-courses/123/uncancel',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
