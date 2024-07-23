import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Acceptance | Route | Certification Centers', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/certification-centers', function () {
    it('should return an HTTP code 200 and a list of certification centers', async function () {
      // given
      const adminMember = await insertUserWithRoleSuperAdmin();
      databaseBuilder.factory.buildCertificationCenter();

      await databaseBuilder.commit();

      //when
      const { result, statusCode } = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminMember.id),
        },
        method: 'GET',
        url: `/api/admin/certification-centers`,
      });

      expect(statusCode).to.equal(200);
      expect(result.data.length).to.equal(1);
    });
  });
});
