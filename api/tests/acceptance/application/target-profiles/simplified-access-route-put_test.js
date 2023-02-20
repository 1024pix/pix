import {
  databaseBuilder,
  expect,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Route | Target-profiles', function () {
  describe('PUT /api/admin/target-profiles/{id}/simplified-access', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();

      const superAdmin = await insertUserWithRoleSuperAdmin();
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/target-profiles/${targetProfile.id}/simplified-access`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(
        JSON.stringify({
          data: {
            type: 'target-profiles',
            id: targetProfile.id.toString(),
            attributes: { 'is-simplified-access': true },
          },
        })
      );
    });
  });
});
