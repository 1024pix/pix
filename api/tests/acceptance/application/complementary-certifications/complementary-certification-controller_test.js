import {
  expect,
  databaseBuilder,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper';

import createServer from '../../../../server';
import { CLEA, PIX_PLUS_EDU_1ER_DEGRE } from '../../../../lib/domain/models/ComplementaryCertification';

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
        label: 'Pix+ Edu 1er degré',
        key: PIX_PLUS_EDU_1ER_DEGRE,
      });
      databaseBuilder.factory.buildComplementaryCertification({
        id: 2,
        label: 'Cléa Numérique',
        key: CLEA,
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
              label: 'Pix+ Edu 1er degré',
              key: PIX_PLUS_EDU_1ER_DEGRE,
            },
          },
          {
            type: 'habilitations',
            id: '2',
            attributes: {
              label: 'Cléa Numérique',
              key: CLEA,
            },
          },
        ],
      });
    });
  });
});
