import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

describe('Acceptance | User-Account | Application | Route | Admin | User', function () {
  describe('PUT /admin/users/:id/unblock', function () {
    it('unblocks user how has tried to many wrong password', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const userLoginId = databaseBuilder.factory.buildUserLogin({ userId }).id;
      const superAdmin = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/admin/users/${userId}/unblock`,
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data.id).to.equal(`${userLoginId}`);
      expect(response.result.data.type).to.equal('user-logins');

      expect(response.result.data.attributes['user-id']).to.equal(userId);
      expect(response.result.data.attributes['failure-count']).to.equal(0);
      expect(response.result.data.attributes['temporary-blocked-until']).to.be.null;
      expect(response.result.data.attributes['blocked-at']).to.be.null;
    });
  });
});
