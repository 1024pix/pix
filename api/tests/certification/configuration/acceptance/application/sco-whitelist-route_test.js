import { CERTIFICATION_CENTER_TYPES } from '../../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

describe('Certification | Configuration | Acceptance | API | sco-whitelist-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/sco-whitelist', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const buffer = 'externalId\next1\next2';
      const options = {
        method: 'POST',
        url: '/api/admin/sco-whitelist',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        payload: buffer,
      };
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CERTIFICATION_CENTER_TYPES.SCO,
        externalId: 'ext1',
        isScoBlockedAccessWhitelist: false,
      });
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CERTIFICATION_CENTER_TYPES.SCO,
        externalId: 'ext2',
        isScoBlockedAccessWhitelist: false,
      });
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CERTIFICATION_CENTER_TYPES.SCO,
        externalId: 'ext3',
        isScoBlockedAccessWhitelist: true,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      const whitelist = await knex('certification-centers')
        .where({ isScoBlockedAccessWhitelist: true })
        .pluck('externalId');
      expect(whitelist).to.deep.equal(['ext1', 'ext2']);
    });
  });
});
