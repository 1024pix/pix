import _ from 'lodash';

import { createServer } from '../../../../../server.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';

import { databaseBuilder, datamartBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Configuration | Acceptance | API | complementary-certification-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/complementary-certifications/', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/complementary-certifications',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
        hasComplementaryReferential: false,
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
              'has-complementary-referential': true,
            },
          },
          {
            type: 'complementary-certifications',
            id: '2',
            attributes: {
              label: 'Cléa Numérique',
              key: ComplementaryCertificationKeys.CLEA,
              'has-complementary-referential': false,
            },
          },
        ],
      });
    });
  });

  describe('GET /api/admin/complementary-certifications/target-profiles/attachable-target-profiles', function () {
    context('when no search term provided', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/complementary-certifications/attachable-target-profiles',
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/complementary-certifications/attachable-target-profiles?searchTerm=that%20way',
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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

  describe('GET /api/admin/complementary-certifications/{complementaryCertificationKey}/target-profiles', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const attachedAt = new Date('2019-01-01');

      databaseBuilder.factory.buildComplementaryCertification({
        id: 3,
        label: 'Pix+ Édu 1er degré',
        hasExternalJury: true,
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
      });

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        label: 'Pix+ Édu 2nd degré',
        hasExternalJury: true,
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_2ND_DEGRE,
      });

      const options = {
        method: 'GET',
        url: `/api/admin/complementary-certifications/${complementaryCertification.key}/target-profiles`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

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
        minimumEarnedPix: 100,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge2.id,
        label: 'badge label',
        complementaryCertificationId: complementaryCertification.id,
        createdAt: attachedAt,
        minimumEarnedPix: 150,
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
                    imageUrl: 'http://badge-image-url.fr',
                    minimumEarnedPix: 100,
                  },
                  {
                    id: 298,
                    level: 1,
                    label: 'badge label',
                    imageUrl: 'http://badge-image-url.fr',
                    minimumEarnedPix: 150,
                  },
                ],
              },
            ],
          },
        },
      });
    });
  });

  describe('PATCH /api/admin/complementary-certifications/{complementaryCertificationKey}/consolidated-framework', function () {
    it('should return 200 HTTP status code and update framework with calibration', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const certificationVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: complementaryCertification.key,
      });
      const certificationFrameworkChallenge = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: 'recChallengeId',
        versionId: certificationVersion.id,
      });

      await databaseBuilder.commit();

      const calibration = datamartBuilder.factory.buildCalibration({
        scope: 'DROIT',
        status: 'VALIDATED',
      });
      const otherCalibration = datamartBuilder.factory.buildCalibration({
        scope: 'DROIT',
        status: 'VALIDATED',
      });
      const activeCalibratedChallenge = datamartBuilder.factory.buildDatamartActiveCalibratedChallenge({
        calibrationId: calibration.id,
        challengeId: 'recChallengeId',
        alpha: 3.3,
        delta: 4.4,
      });
      datamartBuilder.factory.buildDatamartActiveCalibratedChallenge({
        calibrationId: otherCalibration.id,
        challengeId: 'recChallengeId',
        alpha: 3.1,
        delta: 6.4,
      });
      await datamartBuilder.commit();

      const options = {
        method: 'PATCH',
        url: '/api/admin/complementary-certifications/consolidated-framework',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              versionId: certificationVersion.id,
              calibrationId: calibration.id,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      const certificationFrameworksChallenges = await knex('certification-frameworks-challenges').where({
        versionId: certificationVersion.id,
      });
      expect(certificationFrameworksChallenges).to.have.length(1);
      expect(_.omit(certificationFrameworksChallenges[0], 'id', 'createdAt')).to.deep.equal({
        discriminant: activeCalibratedChallenge.alpha,
        difficulty: activeCalibratedChallenge.delta,
        challengeId: certificationFrameworkChallenge.challengeId,
        versionId: certificationVersion.id,
      });
    });
  });
});
