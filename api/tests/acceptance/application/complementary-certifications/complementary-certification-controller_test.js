import {
  expect,
  databaseBuilder,
  insertUserWithRoleSuperAdmin,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { CLEA, PIX_PLUS_EDU_1ER_DEGRE } from '../../../../lib/domain/models/ComplementaryCertification.js';

describe('Acceptance | API | complementary-certification-controller', function () {
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
            type: 'complementary-certifications',
            id: '1',
            attributes: {
              label: 'Pix+ Edu 1er degré',
              key: PIX_PLUS_EDU_1ER_DEGRE,
            },
          },
          {
            type: 'complementary-certifications',
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

  describe('GET /api/admin/complementary-certifications/{id}/target-profiles', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const complementaryCertificationId = 1;
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/complementary-certifications/' + complementaryCertificationId + '/target-profiles',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
      };
      const attachedAt = new Date('2019-01-01');

      databaseBuilder.factory.buildComplementaryCertification({
        id: 3,
        key: 'EDU_1ER_DEGRE',
        label: 'Pix+ Édu 1er degré',
      });

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: complementaryCertificationId,
        key: 'EDU_2ND_DEGRE',
        label: 'Pix+ Édu 2nd degré',
      });

      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 999, name: 'Target' });

      const badge1 = databaseBuilder.factory.buildBadge({
        id: 198,
        key: 'badge1',
        targetProfileId: targetProfile.id,
      });

      const badge2 = databaseBuilder.factory.buildBadge({
        id: 298,
        key: 'badge2',
        targetProfileId: targetProfile.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge1.id,
        label: 'another badge label',
        complementaryCertificationId: complementaryCertification.id,
        createdAt: attachedAt,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge2.id,
        label: 'badge label',
        complementaryCertificationId: complementaryCertification.id,
        createdAt: attachedAt,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'complementary-certifications',
          id: '1',
          attributes: {
            label: 'Pix+ Édu 2nd degré',
            key: 'EDU_2ND_DEGRE',
            'current-target-profile-badges': [
              {
                id: 198,
                level: 1,
                label: 'another badge label',
              },
              {
                id: 298,
                level: 1,
                label: 'badge label',
              },
            ],
            'target-profiles-history': [
              {
                id: 999,
                name: 'Target',
                attachedAt,
                detachedAt: null,
              },
            ],
          },
        },
      });
    });
  });
});
