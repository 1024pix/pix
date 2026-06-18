import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Certification | Configuration | API | certification-version-route', function () {
  let server;
  let superAdmin;

  beforeEach(async function () {
    server = await createServer();
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
  });

  describe('GET /api/admin/certification-versions/{certificationVersionId}', function () {
    it('should return the version details with areas for a given id', async function () {
      // given
      const version = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2025-01-11'),
        expirationDate: new Date('2026-01-01'),
        assessmentDuration: 100,
        minimumAnswersRequiredToValidateACertification: 20,
        comments: 'Some awesome comments',
        challengesConfiguration: {
          maximumAssessmentLength: 32,
          challengesBetweenSameCompetence: 2,
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: true,
          variationPercent: 0.5,
          defaultCandidateCapacity: -3,
          defaultProbabilityToPickChallenge: 51,
        },
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({ versionId: version.id });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-versions/${version.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: String(version.id),
        type: 'certification-versions',
        attributes: {
          'start-date': new Date('2025-01-11'),
          'expiration-date': new Date('2026-01-01'),
          'assessment-duration': 100,
          'minimum-answers-required-for-validation': 20,
          'maximum-assessment-length': 32,
          comments: 'Some awesome comments',
        },
        relationships: {
          areas: { data: [] },
        },
      });
      expect(response.result.included).to.be.undefined;
    });
  });

  describe('PATCH /api/admin/certification-versions/{certificationVersionId}', function () {
    it('updates the details of a version for a given id', async function () {
      // given
      const version = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: new Date('2025-01-11'),
        expirationDate: new Date('2026-01-01'),
        assessmentDuration: 100,
        minimumAnswersRequiredToValidateACertification: 20,
        challengesConfiguration: {
          maximumAssessmentLength: 32,
          challengesBetweenSameCompetence: 2,
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: true,
          variationPercent: 0.5,
          defaultCandidateCapacity: -3,
          defaultProbabilityToPickChallenge: 51,
        },
        comments: 'Old comments',
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        versionId: version.id,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/certification-versions/${version.id}`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
        payload: {
          data: {
            id: version.id,
            attributes: {
              'assessment-duration': 120,
              'minimum-answers-required-for-validation': 20,
              'maximum-assessment-length': 30,
              comments: 'Newly updated comments',
            },
            type: 'certification-versions',
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const [updatedVersion] = await knex('certification_versions').where({ id: version.id });
      expect(updatedVersion.comments).to.equal('Newly updated comments');
    });
  });

  describe('DELETE /api/admin/certification-versions/{id}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
        startDate: null,
        expirationDate: null,
      }).id;

      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/admin/certification-versions/${versionId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST /api/admin/certification-versions', function () {
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
        url: `/api/admin/certification-versions`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              tubeIds: [tube1.id],
              scope: SCOPES.CORE,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      const createdVersion = await knex('certification_versions').where({ scope: SCOPES.CORE }).first();
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

      const certificationChallenges = await knex('certification-frameworks-challenges')
        .select('discriminant', 'difficulty', 'challengeId', 'versionId')
        .where({ versionId: createdVersion?.id });

      expect(certificationChallenges).to.deep.equal([
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
