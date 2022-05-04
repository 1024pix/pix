const {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Application | Admin-members | Routes', function () {
  describe('GET /api/admin/admin-members/me', function () {
    it('should return 200 http status code', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildPixAdminRole({ userId: user.id, role: 'SUPER_ADMIN' });
      const admin = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(admin.id),
        },
        method: 'GET',
        url: '/api/admin/admin-members/me',
      });

      // then
      expect(response.statusCode).to.equal(200);
    });
    it('should return 404 http status code when user is not a member of pix admin and has no role', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
      const server = await createServer();

      // when
      const response = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
        method: 'GET',
        url: '/api/admin/admin-members/me',
      });

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.statusMessage).to.equal('Not Found');
    });
  });
});
