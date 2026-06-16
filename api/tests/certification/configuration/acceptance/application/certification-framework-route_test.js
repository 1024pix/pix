import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../src/certification/shared/domain/constants.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Application | Certification | Configuration | certification-framework-route', function () {
  let server;
  let superAdmin;

  beforeEach(async function () {
    server = await createServer();
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
  });

  describe('GET /api/admin/certification-frameworks', function () {
    it('should return 200 HTTP status code with all frameworks', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/admin/certification-frameworks',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      const coreStartDate = new Date('2025-01-15');

      databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: coreStartDate,
        expirationDate: null,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.deep.members([
        {
          type: 'certification-frameworks',
          id: Frameworks.CORE,
          attributes: {
            name: Frameworks.CORE,
            'active-version-start-date': coreStartDate,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.DROIT,
          attributes: {
            name: Frameworks.DROIT,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_1ER_DEGRE,
          attributes: {
            name: Frameworks.EDU_1ER_DEGRE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_2ND_DEGRE,
          attributes: {
            name: Frameworks.EDU_2ND_DEGRE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.EDU_CPE,
          attributes: {
            name: Frameworks.EDU_CPE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.PRO_SANTE,
          attributes: {
            name: Frameworks.PRO_SANTE,
            'active-version-start-date': null,
          },
        },
        {
          type: 'certification-frameworks',
          id: Frameworks.CLEA,
          attributes: {
            name: Frameworks.CLEA,
            'active-version-start-date': null,
          },
        },
      ]);
    });
  });

  describe('GET /api/admin/certification-frameworks/{scope}/framework-history', function () {
    it('should return the framework history for given scope ordered by start date descending', async function () {
      // given
      const newerVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2025-01-11'),
        expirationDate: null,
      });

      const olderVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2024-01-11'),
        expirationDate: newerVersion.startDate,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-frameworks/${SCOPES.CORE}/framework-history`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: SCOPES.CORE,
        type: 'framework-histories',
        attributes: {
          scope: SCOPES.CORE,
          history: [
            {
              id: newerVersion.id,
              startDate: newerVersion.startDate,
              expirationDate: newerVersion.expirationDate,
              assessmentDuration: newerVersion.assessmentDuration,
              maximumAssessmentLength: JSON.parse(newerVersion.challengesConfiguration).maximumAssessmentLength,
              status: 'ACTIVE',
            },
            {
              id: olderVersion.id,
              startDate: olderVersion.startDate,
              expirationDate: olderVersion.expirationDate,
              assessmentDuration: olderVersion.assessmentDuration,
              maximumAssessmentLength: JSON.parse(olderVersion.challengesConfiguration).maximumAssessmentLength,
              status: 'ARCHIVED',
            },
          ],
        },
      });
    });
  });

  describe('GET /api/admin/certification-frameworks/{scope}/target-profiles', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const attachedAt = new Date('2019-01-01');
      const scope = SCOPES.PIX_PLUS_DROIT;

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        label: 'Pix+ Droit',
        hasExternalJury: true,
        key: scope,
      });

      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 999, name: 'Target' });

      const badge = databaseBuilder.factory.buildBadge({
        id: 198,
        key: 'badge',
        targetProfileId: targetProfile.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: badge.id,
        label: 'badge label',
        complementaryCertificationId: complementaryCertification.id,
        createdAt: attachedAt,
        minimumEarnedPix: 150,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-frameworks/${scope}/target-profiles`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'certification-frameworks',
          id: scope,
          attributes: {
            name: scope,
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

  describe('POST /api/admin/frameworks/{scope}/version', function () {
    const now = new Date('2025-06-15T12:00:00Z');

    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return 201 HTTP status code and a new version as a draft and link his challenges', async function () {
      // given
      const framework = databaseBuilder.factory.learningContent.buildFramework({
        id: 'Pix',
        name: SCOPES.CORE,
      });
      const area = databaseBuilder.factory.learningContent.buildArea({ id: 'areaId', frameworkId: framework.id });
      const competence = databaseBuilder.factory.learningContent.buildCompetence({
        id: 'competenceId',
        areaId: area.id,
      });
      const tubeId = 'myTubeId';

      const thematic = databaseBuilder.factory.learningContent.buildThematic({
        id: 'aboutToBeRefreshedThematicId',
        name_i18n: {
          fr: 'name_i18n FR About to be refreshed Thematique - old',
          en: 'name_i18n EN About to be refreshed Thematique - old',
        },
        index: 1,
        competenceId: competence.id,
        tubeIds: ['myTubeId'],
      });
      const skill = databaseBuilder.factory.learningContent.buildSkill({
        tubeId,
        status: 'actif',
      });
      const tube1 = databaseBuilder.factory.learningContent.buildTube({
        id: tubeId,
        competenceId: competence.id,
        thematicId: thematic.id,
        skillIds: [skill.id],
      });
      const challenge = databaseBuilder.factory.learningContent.buildChallenge({
        skillId: skill.id,
        discriminant: 2.1,
        difficulty: 3.4,
        status: 'validé',
        locales: ['fr-fr'],
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/frameworks/${SCOPES.CORE}/version`,
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

      const certificationVersions = await knex('certification_versions')
        .where({ scope: SCOPES.CORE })
        .orderBy('startDate', 'desc');

      const [createdVersion] = certificationVersions;
      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result).to.deep.equal({
        data: {
          id: String(createdVersion.id),
          type: 'certification-versions',
          attributes: {
            'assessment-duration': createdVersion.assessmentDuration,
            'maximum-assessment-length': createdVersion.challengesConfiguration.maximumAssessmentLength,
            'minimum-answers-required-for-validation': createdVersion.minimumAnswersRequiredToValidateACertification,
            'expiration-date': createdVersion.expirationDate,
            'start-date': null,
            comments: createdVersion.comments,
          },
          relationships: {
            areas: {
              data: [
                {
                  id: 'areaId',
                  type: 'areas',
                },
              ],
            },
          },
        },
        included: [
          {
            attributes: {
              difficulty: 2,
            },
            id: 'skillIdA',
            type: 'skills',
          },
          {
            attributes: {
              name: 'name Tube A',
              'practical-title': 'practicalTitle FR Tube A',
            },
            id: 'myTubeId',
            relationships: {
              skills: {
                data: [
                  {
                    id: 'skillIdA',
                    type: 'skills',
                  },
                ],
              },
            },
            type: 'tubes',
          },
          {
            attributes: {
              index: 1,
              name: 'name_i18n FR About to be refreshed Thematique - old',
            },
            id: 'aboutToBeRefreshedThematicId',
            relationships: {
              tubes: {
                data: [
                  {
                    id: 'myTubeId',
                    type: 'tubes',
                  },
                ],
              },
            },
            type: 'thematics',
          },
          {
            attributes: {
              index: 'index Compétence A',
              name: 'name FR Compétence A',
            },
            id: 'competenceId',
            relationships: {
              thematics: {
                data: [
                  {
                    id: 'aboutToBeRefreshedThematicId',
                    type: 'thematics',
                  },
                ],
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              code: 'code Domaine A',
              color: 'color Domaine A',
              'framework-id': 'Pix',
              title: 'title FR Domaine A',
            },
            id: 'areaId',
            relationships: {
              competences: {
                data: [
                  {
                    id: 'competenceId',
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
        ],
      });

      expect(certificationVersions.length).to.equal(1);
      expect(createdVersion).to.deep.include({
        scope: SCOPES.CORE,
        startDate: null,
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        challengesConfiguration: {
          challengesBetweenSameCompetence: 0,
          variationPercent: 1,
          defaultCandidateCapacity: 0,
          maximumAssessmentLength: 32,
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: true,
          defaultProbabilityToPickChallenge: 51,
        },
      });

      const consolidatedFramework = await knex('certification-frameworks-challenges')
        .select('discriminant', 'difficulty', 'challengeId', 'versionId')
        .where({ versionId: createdVersion?.id });

      expect(consolidatedFramework).to.deep.equal([
        {
          discriminant: null,
          difficulty: null,
          challengeId: challenge.id,
          versionId: createdVersion?.id,
        },
      ]);
    });
  });
});
