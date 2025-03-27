import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Prescription | Target Profile | Acceptance | Route | framework-profile', function () {
  let server, user;

  beforeEach(async function () {
    server = await createServer();
    user = await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/admin/frameworks', function () {
    it('should return the serialized frameworks', async function () {
      // given
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId0',
        name: 'mon framework 0',
      });
      databaseBuilder.factory.learningContent.buildFramework({
        id: 'recId1',
        name: 'mon framework 1',
      });
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: `/api/admin/frameworks`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.map(({ id }) => id)).to.deep.equal(['recId0', 'recId1']);
    });
  });
});
