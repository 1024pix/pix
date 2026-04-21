import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../src/certification/shared/domain/constants.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Application | Certification | ComplementaryCertification | certification-framework-route', function () {
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

  describe('GET /api/admin/certification-frameworks/{scope}/active-consolidated-framework', function () {
    it('should return the active consolidated framework', async function () {
      // given
      const minimalLearningContent = [
        {
          id: 'recAreaCore',
          competences: [
            {
              id: 'recCompCore',
              thematics: [
                {
                  id: 'recThemCore',
                  tubes: [
                    {
                      id: 'recTubeCore',
                      skills: [
                        { id: 'skillCore@web1', challenges: [{ id: 'recChallenge1', langues: ['Franco Français'] }] },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      databaseBuilder.factory.learningContent.build(learningContentObjects);

      const certificationVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2025-01-15'),
        expirationDate: null,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: 'recChallenge1',
        discriminant: 1.5,
        difficulty: 2.3,
        createdAt: new Date('2025-01-15'),
        versionId: certificationVersion.id,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: 'anotherScopeChallenge',
        versionId: databaseBuilder.factory.buildCertificationVersion({ scope: SCOPES.DROIT }).id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-frameworks/${SCOPES.CORE}/active-consolidated-framework`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: SCOPES.CORE,
        type: 'certification-consolidated-frameworks',
        attributes: {
          'complementary-certification-key': SCOPES.CORE,
          version: String(certificationVersion.id),
        },
        relationships: {
          areas: {
            data: [
              {
                id: 'recAreaCore',
                type: 'areas',
              },
            ],
          },
        },
      });
      expect(response.result.included).to.have.lengthOf(5);
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
        expirationDate: newerVersion.expirationDate,
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
            { id: newerVersion.id, startDate: newerVersion.startDate, expirationDate: newerVersion.expirationDate },
            { id: olderVersion.id, startDate: olderVersion.startDate, expirationDate: olderVersion.expirationDate },
          ],
        },
      });
    });
  });

  describe('POST /api/admin/frameworks/{scope}/new-version', function () {
    const now = new Date('2025-06-15T12:00:00Z');

    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return 201 HTTP status code and create a new framework', async function () {
      // given
      const tubeId = 'myTubeId';
      const skill = databaseBuilder.factory.learningContent.buildSkill({
        tubeId,
        status: 'actif',
      });
      const tube1 = databaseBuilder.factory.learningContent.buildTube({ id: tubeId, skillIds: [skill.id] });
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
        url: `/api/admin/frameworks/${SCOPES.CORE}/new-version`,
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
      expect(response.result).to.deep.equal({
        data: {
          id: SCOPES.CORE,
          type: 'certification-consolidated-framework',
        },
      });

      const certificationVersion = await knex('certification_versions')
        .where({ scope: SCOPES.CORE })
        .orderBy('startDate', 'desc')
        .first();

      expect(certificationVersion).to.deep.include({
        scope: SCOPES.CORE,
        startDate: now,
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
        .where({ versionId: certificationVersion.id });
      expect(consolidatedFramework).to.deep.equal([
        {
          discriminant: null,
          difficulty: null,
          challengeId: challenge.id,
          versionId: certificationVersion.id,
        },
      ]);
    });

    it('should create a new version and expire the previous one when a version already exists', async function () {
      // given
      const existingVersionStartDate = new Date('2024-01-01');
      const existingVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: existingVersionStartDate,
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
      });

      const tubeId = 'myTubeId';
      const skill = databaseBuilder.factory.learningContent.buildSkill({
        tubeId,
        status: 'actif',
      });
      const tube1 = databaseBuilder.factory.learningContent.buildTube({ id: tubeId, skillIds: [skill.id] });
      const challenge = databaseBuilder.factory.learningContent.buildChallenge({
        skillId: skill.id,
        status: 'validé',
        locales: ['fr-fr'],
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/frameworks/${SCOPES.CORE}/new-version`,
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
      expect(response.result).to.deep.equal({
        data: {
          id: SCOPES.CORE,
          type: 'certification-consolidated-framework',
        },
      });

      const versions = await knex('certification_versions').where({ scope: SCOPES.CORE }).orderBy('startDate', 'asc');

      expect(versions).to.have.lengthOf(2);

      const [oldVersion, newVersion] = versions;

      expect(oldVersion).to.deep.include({
        id: existingVersion.id,
        startDate: existingVersionStartDate,
        expirationDate: now,
      });

      expect(newVersion).to.deep.include({
        startDate: now,
        expirationDate: null,
      });

      const frameworkChallenges = await knex('certification-frameworks-challenges')
        .select('challengeId', 'versionId')
        .where({ versionId: newVersion.id });

      expect(frameworkChallenges).to.deep.equal([
        {
          challengeId: challenge.id,
          versionId: newVersion.id,
        },
      ]);
    });
  });
});
