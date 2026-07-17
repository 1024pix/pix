import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
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
    createLearningContent();
    await databaseBuilder.commit();
  });

  describe('GET /api/certifications/{framework}/info', function () {
    it('returns serialized info of the request framework', async function () {
      databaseBuilder.factory.buildCertificationVersion({
        id: 123,
        scope: SCOPES.CORE,
        startDate: new Date('2025-01-11'),
        expirationDate: null,
        assessmentDuration: 100,
        minimumAnswersRequiredToValidateACertification: 20,
        challengesConfiguration: {
          maximumAssessmentLength: 32,
        },
      });
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeA',
        versionId: 123,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/certifications/${Frameworks.CORE}/info`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: Frameworks.CORE,
        type: 'certification-infos',
        attributes: {
          'assessment-duration': 100,
          'minimum-assessment-length': 20,
          'maximum-assessment-length': 32,
        },
      });
    });
  });

  describe('GET /api/admin/certification-versions/{certificationVersionId}', function () {
    it('should return the version details with areas for a given id', async function () {
      // given
      const version = databaseBuilder.factory.buildCertificationVersion({
        id: 123,
        scope: SCOPES.CORE,
        startDate: new Date('2025-01-11'),
        expirationDate: new Date('2026-01-01'),
        status: VERSION_STATUSES.ARCHIVED,
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
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeA',
        versionId: 123,
      });

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
          'challenges-between-same-competence': 2,
          'default-probability-to-pick-challenge': 51,
          'variation-percent': 0.5,
          'default-candidate-capacity': -3,
          'limit-to-one-question-per-tube': true,
          'enable-passage-by-all-competences': true,
          status: VERSION_STATUSES.ARCHIVED,
          scope: SCOPES.CORE,
          comments: 'Some awesome comments',
        },
        relationships: {
          areas: {
            data: [
              {
                type: 'areas',
                id: 'areaA',
              },
            ],
          },
        },
      });
      expect(response.result.included).to.deep.include.members([
        {
          type: 'areas',
          id: 'areaA',
          attributes: {
            code: 'code Domaine A',
            color: 'color Domaine A',
            'framework-id': 'frameworkA',
            title: 'title FR Domaine A',
          },
          relationships: {
            competences: {
              data: [
                {
                  type: 'competences',
                  id: 'competenceA',
                },
              ],
            },
          },
        },
        {
          type: 'competences',
          id: 'competenceA',
          attributes: {
            index: 'index Competence A',
            name: 'name FR Competence A',
          },
          relationships: {
            thematics: {
              data: [
                {
                  type: 'thematics',
                  id: 'thematicA',
                },
              ],
            },
          },
        },
        {
          type: 'thematics',
          id: 'thematicA',
          attributes: {
            index: 1,
            name: 'name FR Thematic A',
          },
          relationships: {
            tubes: {
              data: [
                {
                  type: 'tubes',
                  id: 'tubeA',
                },
              ],
            },
          },
        },
        {
          type: 'tubes',
          id: 'tubeA',
          attributes: {
            mobile: true,
            name: 'Titre pratique Tube A',
            'practical-title': 'practicalTitle FR Tube A',
            tablet: false,
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: 'skillA',
                },
              ],
            },
          },
        },
        {
          type: 'skills',
          id: 'skillA',
          attributes: {
            difficulty: 2,
          },
        },
      ]);
    });
  });

  describe('PATCH /api/admin/certification-versions/{certificationVersionId}', function () {
    it('updates the details of a version for a given id', async function () {
      // given
      const version = databaseBuilder.factory.buildCertificationVersion({
        id: 123,
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
        status: VERSION_STATUSES.DRAFT,
      });
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeA',
        versionId: 123,
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
              'start-date': new Date('2020-02-02'),
              'assessment-duration': 1,
              'minimum-answers-required-for-validation': 2,
              'maximum-assessment-length': 3,
              'challenges-between-same-competence': 4,
              'default-probability-to-pick-challenge': 5,
              'variation-percent': 0.6,
              'default-candidate-capacity': 7,
              'limit-to-one-question-per-tube': true,
              'enable-passage-by-all-competences': true,
            },
            type: 'certification-versions',
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PATCH /api/admin/certification-versions/{certificationVersionId}/comments', function () {
    it('updates only comment of a version for a given id', async function () {
      // given
      const version = databaseBuilder.factory.buildCertificationVersion({
        id: 123,
        status: VERSION_STATUSES.ACTIVE,
        comments: 'Old comments',
      });
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeA',
        versionId: 123,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/certification-versions/${version.id}/comments`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
        payload: {
          data: {
            id: version.id,
            attributes: {
              comments: 'COUCOU',
            },
            type: 'certification-versions',
          },
        },
      };

      // when
      const response = await server.inject(options);

      const updatedVersion = await knex('certification_versions').where({ id: version.id }).first();

      // then
      expect(response.statusCode).to.equal(204);
      expect(updatedVersion.comments).equal('COUCOU');
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
      databaseBuilder.factory.buildCertificationVersionTube({
        tubeId: 'tubeA',
        versionId: versionId,
      });

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
      const options = {
        method: 'POST',
        url: `/api/admin/certification-versions`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              tubeIds: ['tubeA'],
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
      expect(response.result.data).to.deep.equal({
        id: String(createdVersion.id),
        type: 'certification-versions',
        attributes: {
          'assessment-duration': 105,
          'minimum-answers-required-for-validation': 20,
          'maximum-assessment-length': 32,
          'challenges-between-same-competence': 0,
          'default-probability-to-pick-challenge': 51,
          'variation-percent': 1,
          'default-candidate-capacity': 0,
          'limit-to-one-question-per-tube': true,
          'enable-passage-by-all-competences': true,
          status: VERSION_STATUSES.DRAFT,
          'expiration-date': null,
          'start-date': null,
          scope: SCOPES.CORE,
          comments: null,
        },
        relationships: {
          areas: {
            data: [
              {
                id: 'areaA',
                type: 'areas',
              },
            ],
          },
        },
      });
      expect(response.result.included).to.deep.include.members([
        {
          type: 'areas',
          id: 'areaA',
          attributes: {
            code: 'code Domaine A',
            color: 'color Domaine A',
            'framework-id': 'frameworkA',
            title: 'title FR Domaine A',
          },
          relationships: {
            competences: {
              data: [
                {
                  type: 'competences',
                  id: 'competenceA',
                },
              ],
            },
          },
        },
        {
          type: 'competences',
          id: 'competenceA',
          attributes: {
            index: 'index Competence A',
            name: 'name FR Competence A',
          },
          relationships: {
            thematics: {
              data: [
                {
                  type: 'thematics',
                  id: 'thematicA',
                },
              ],
            },
          },
        },
        {
          type: 'thematics',
          id: 'thematicA',
          attributes: {
            index: 1,
            name: 'name FR Thematic A',
          },
          relationships: {
            tubes: {
              data: [
                {
                  type: 'tubes',
                  id: 'tubeA',
                },
              ],
            },
          },
        },
        {
          type: 'tubes',
          id: 'tubeA',
          attributes: {
            mobile: true,
            name: 'Titre pratique Tube A',
            'practical-title': 'practicalTitle FR Tube A',
            tablet: false,
          },
          relationships: {
            skills: {
              data: [
                {
                  type: 'skills',
                  id: 'skillA',
                },
              ],
            },
          },
        },
        {
          type: 'skills',
          id: 'skillA',
          attributes: {
            difficulty: 2,
          },
        },
      ]);
    });
  });
});

function createLearningContent() {
  databaseBuilder.factory.learningContent.buildFramework({
    id: 'frameworkA',
  });
  databaseBuilder.factory.learningContent.buildFramework({
    id: 'frameworkB',
  });
  databaseBuilder.factory.learningContent.buildArea({
    id: 'areaA',
    frameworkId: 'frameworkA',
    code: 'code Domaine A',
    title_i18n: { fr: 'title FR Domaine A' },
    color: 'color Domaine A',
  });
  databaseBuilder.factory.learningContent.buildArea({
    id: 'areaB',
    frameworkId: 'frameworkB',
    code: 'code Domaine B',
    title_i18n: { fr: 'title FR Domaine B' },
    color: 'color Domaine B',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'competenceA',
    areaId: 'areaA',
    name_i18n: { fr: 'name FR Competence A' },
    index: 'index Competence A',
  });
  databaseBuilder.factory.learningContent.buildCompetence({
    id: 'competenceB',
    areaId: 'areaB',
    name_i18n: { fr: 'name FR Competence B' },
    index: 'index Competence B',
  });
  databaseBuilder.factory.learningContent.buildThematic({
    id: 'thematicA',
    competenceId: 'competenceA',
    name_i18n: { fr: 'name FR Thematic A' },
    index: 1,
  });
  databaseBuilder.factory.learningContent.buildThematic({
    id: 'thematicB',
    competenceId: 'competenceB',
    name_i18n: { fr: 'name FR Thematic B' },
    index: 2,
  });
  databaseBuilder.factory.learningContent.buildTube({
    id: 'tubeA',
    thematicId: 'thematicA',
    competenceId: 'competenceA',
    name: 'Titre pratique Tube A',
    practicalTitle_i18n: { fr: 'practicalTitle FR Tube A' },
    isMobileCompliant: true,
    isTabletCompliant: false,
    skillIds: ['skillA'],
  });
  databaseBuilder.factory.learningContent.buildTube({
    id: 'tubeB',
    thematicId: 'thematicB',
    competenceId: 'competenceB',
    name: 'Titre pratique Tube B',
    practicalTitle_i18n: { fr: 'practicalTitle FR Tube B' },
    isMobileCompliant: false,
    isTabletCompliant: true,
    skillIds: ['skillB'],
  });
  databaseBuilder.factory.learningContent.buildSkill({
    id: 'skillA',
    tubeId: 'tubeA',
    level: 2,
  });
  databaseBuilder.factory.learningContent.buildSkill({
    id: 'skillB',
    tubeId: 'tubeB',
    level: 6,
  });
}
