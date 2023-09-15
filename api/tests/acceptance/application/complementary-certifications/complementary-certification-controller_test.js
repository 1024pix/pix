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
        label: 'Pix+ Édu 1er degré',
        hasExternalJury: true,
      });

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: complementaryCertificationId,
        label: 'Pix+ Édu 2nd degré',
        hasExternalJury: true,
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
            'has-external-jury': true,
            'target-profiles-history': [
              {
                id: 999,
                name: 'Target',
                attachedAt,
                detachedAt: null,
                badges: [
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
              },
            ],
          },
        },
      });
    });
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
