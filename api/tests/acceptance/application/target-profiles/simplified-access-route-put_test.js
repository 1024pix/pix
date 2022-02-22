const {
  databaseBuilder,
  expect,
  insertUserWithRolePixMaster,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | Target-profiles', function () {
  describe('PUT /api/admin/target-profiles/{id}/simplified-access', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const server = await createServer();

      const pixMaster = await insertUserWithRolePixMaster();
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/target-profiles/${targetProfile.id}/simplified-access`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(pixMaster.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
