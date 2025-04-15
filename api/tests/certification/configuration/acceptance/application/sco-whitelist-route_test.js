import { CenterTypes } from '../../../../../src/certification/configuration/domain/models/CenterTypes.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../src/shared/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';

describe('Certification | Configuration | Acceptance | API | sco-whitelist-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/sco-whitelist', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const buffer = 'externalId\next1\next2';
      const options = {
        method: 'POST',
        url: '/api/admin/sco-whitelist',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: buffer,
      };
      databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        externalId: 'ext1',
        isScoBlockedAccessWhitelist: false,
      });
      databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        externalId: 'ext2',
        isScoBlockedAccessWhitelist: false,
      });
      databaseBuilder.factory.buildCertificationCenter({
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

    it('should rollback if invalid whitelist given', async function () {
      // given
      const thisExternalIdCannotBeWhitelisted = 'NOT_A_SCO_EXTERNAL_ID';
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const buffer = `externalId\next1\n${thisExternalIdCannotBeWhitelisted}`;
      const options = {
        method: 'POST',
        url: '/api/admin/sco-whitelist',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: buffer,
      };
      databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        externalId: 'ext1',
        isScoBlockedAccessWhitelist: false,
      });
      databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.PRO,
        externalId: thisExternalIdCannotBeWhitelisted,
        isScoBlockedAccessWhitelist: false,
      });
      const whitelistRollbackedToThis = databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
        externalId: 'ext3',
        isScoBlockedAccessWhitelist: true,
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.result.errors[0]).to.deep.equal({
        status: '422',
        code: 'CERTIFICATION_INVALID_SCO_WHITELIST_ERROR',
        title: 'Unprocessable entity',
        detail: 'La liste blanche contient des données invalides.',
        meta: {
          numberOfExternalIdsInInput: 2,
          numberOfValidExternalIds: 1,
        },
      });
      const whitelist = await knex('certification-centers')
        .where({ isScoBlockedAccessWhitelist: true })
        .pluck('externalId');
      expect(whitelist).to.deep.equal([whitelistRollbackedToThis.externalId]);
    });
  });

  describe('GET /api/admin/sco-whitelist', function () {
    it('should return 200 HTTP status code and whitelist as CSV', async function () {
      // given
      const BOM_CHAR = '\ufeff';
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/sco-whitelist',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        isScoBlockedAccessWhitelist: true,
        externalId: 'I_AM_WHITELISTED',
      });
      databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        isScoBlockedAccessWhitelist: false,
        externalId: 'I_AM_NOT_WHITELISTED',
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(`${BOM_CHAR}"externalId"\n"I_AM_WHITELISTED"`);
    });
  });
});
