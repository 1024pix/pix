import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Session-management | Acceptance | cancellation-route', function () {
  describe('POST /api/admin/certification-courses/{id}/cancel', function () {
    it('should respond with a 200', async function () {
      // given
      const server = await createServer();
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
});
