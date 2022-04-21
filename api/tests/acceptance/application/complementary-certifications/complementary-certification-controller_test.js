const {
  expect,
  databaseBuilder,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | API | complementary-certification-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/habilitations/', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/habilitations',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
      };
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        name: 'Pix+Edu',
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 2,
        name: 'Cléa Numérique',
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'habilitations',
            id: '1',
            attributes: {
              name: 'Pix+Edu',
            },
          },
          {
            type: 'habilitations',
            id: '2',
            attributes: {
              name: 'Cléa Numérique',
            },
          },
        ],
      });
    });
  });
});
