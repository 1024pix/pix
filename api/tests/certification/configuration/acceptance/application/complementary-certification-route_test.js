import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Configuration | Acceptance | API | complementary-certification-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/complementary-certifications/', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/complementary-certifications',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
      };
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        label: 'Pix+ Edu 1er degré',
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 2,
        label: 'Cléa Numérique',
        key: ComplementaryCertificationKeys.CLEA,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            type: 'complementary-certifications',
            id: '1',
            attributes: {
              label: 'Pix+ Edu 1er degré',
              key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
            },
          },
          {
            type: 'complementary-certifications',
            id: '2',
            attributes: {
              label: 'Cléa Numérique',
              key: ComplementaryCertificationKeys.CLEA,
            },
          },
        ],
      });
    });
  });
});
