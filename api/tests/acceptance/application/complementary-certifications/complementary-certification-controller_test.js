const {
  expect,
  databaseBuilder,
  insertUserWithRolePixMaster,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | API | complementary-certification-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/accreditations/', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const pixMaster = await insertUserWithRolePixMaster();
      const options = {
        method: 'GET',
        url: '/api/accreditations',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(pixMaster.id),
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
            type: 'accreditations',
            id: '1',
            attributes: {
              name: 'Pix+Edu',
            },
          },
          {
            type: 'accreditations',
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
