import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

describe('Acceptance | API | complementary-certification-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/complementary-certifications/target-profiles/attachable-target-profiles', function () {
    context('when no search term provided', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/complementary-certifications/attachable-target-profiles',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
        };

        databaseBuilder.factory.buildTargetProfile({
          id: 1,
          name: 'aValidResult',
          outdated: false,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'attachable-target-profiles',
              id: '1',
              attributes: {
                name: 'aValidResult',
              },
            },
          ],
        });
      });
    });

    context('when a search term is provided', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/complementary-certifications/attachable-target-profiles?searchTerm=that%20way',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
        };

        databaseBuilder.factory.buildTargetProfile({
          id: 1,
          name: 'Yakalelo',
          outdated: false,
        });
        databaseBuilder.factory.buildTargetProfile({
          id: 2,
          name: 'I want it that way',
          outdated: false,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'attachable-target-profiles',
              id: '2',
              attributes: {
                name: 'I want it that way',
              },
            },
          ],
        });
      });
    });
  });
});
