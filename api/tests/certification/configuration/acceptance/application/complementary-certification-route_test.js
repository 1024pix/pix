import _ from 'lodash';

import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import {
  createServer,
  databaseBuilder,
  datamartBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  insertUserWithRoleSuperAdmin,
  knex,
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

  describe('GET /api/admin/complementary-certifications/target-profiles/attachable-target-profiles', function () {
    context('when no search term provided', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
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
        const superAdmin = await insertUserWithRoleSuperAdmin();
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

  describe('GET /api/admin/complementary-certifications/{complementaryCertificationId}/target-profiles', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const complementaryCertificationId = 1;
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const options = {
        method: 'GET',
        url: '/api/admin/complementary-certifications/' + complementaryCertificationId + '/target-profiles',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };
      const attachedAt = new Date('2019-01-01');

      databaseBuilder.factory.buildComplementaryCertification({
        id: 3,
        label: 'Pix+ Édu 1er degré',
        hasExternalJury: true,
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
      });

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: complementaryCertificationId,
        label: 'Pix+ Édu 2nd degré',
        hasExternalJury: true,
        key: ComplementaryCertificationKeys.PIX_PLUS_EDU_2ND_DEGRE,
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

  describe('POST /api/admin/complementary-certifications/{complementaryCertificationKey}/consolidated-framework', function () {
    it('should return 201 HTTP status code and create a new framework', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const tubeId = 'myTubeId';
      const skill = databaseBuilder.factory.learningContent.buildSkill({
        tubeId,
        status: 'actif',
      });
      const tube1 = databaseBuilder.factory.learningContent.buildTube({ id: tubeId, skillIds: [skill.id] });
      const challenge = databaseBuilder.factory.learningContent.buildChallenge({
        skillId: skill.id,
        alpha: 2.1,
        delta: 3.4,
        status: 'validé',
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/complementary-certifications/${complementaryCertification.key}/consolidated-framework`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              tubeIds: [tube1.id],
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal('certification-consolidated-framework');
      expect(response.result.data.id).to.exist;

      const consolidatedFramework = await knex('certification-frameworks-challenges')
        .select('alpha', 'delta', 'challengeId', 'complementaryCertificationKey')
        .where({
          complementaryCertificationKey: complementaryCertification.key,
        });
      expect(consolidatedFramework).to.deep.equal([
        {
          alpha: null,
          delta: null,
          challengeId: challenge.id,
          complementaryCertificationKey: complementaryCertification.key,
        },
      ]);
    });
  });

  describe('PATCH /api/admin/complementary-certifications/{complementaryCertificationKey}/consolidated-framework', function () {
    it('should return 200 HTTP status code and update framework with calibration', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const createdAt = new Date('2023-06-18');
      const certificationFrameworkChallenge = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: 'recChallengeId',
        complementaryCertificationKey: complementaryCertification.key,
        createdAt,
      });

      await databaseBuilder.commit();

      const activeCalibratedChallenge = datamartBuilder.factory.buildActiveCalibratedChallenge({
        calibrationId: 1,
        challengeId: 'recChallengeId',
        alpha: 3.3,
        delta: 4.4,
        scope: 'DROIT',
      });
      await datamartBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/complementary-certifications/${complementaryCertification.key}/consolidated-framework`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              createdAt,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      const consolidatedFramework = await knex('certification-frameworks-challenges').where({
        complementaryCertificationKey: complementaryCertification.key,
        createdAt,
      });
      expect(consolidatedFramework).to.have.length(1);
      expect(_.omit(consolidatedFramework[0], 'id')).to.deep.equal({
        alpha: activeCalibratedChallenge.alpha,
        delta: activeCalibratedChallenge.delta,
        challengeId: certificationFrameworkChallenge.challengeId,
        complementaryCertificationKey: complementaryCertification.key,
        createdAt: certificationFrameworkChallenge.createdAt,
      });
    });
  });
});
