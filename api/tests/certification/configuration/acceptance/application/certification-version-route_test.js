import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Certification | Configuration | API | certification-version-route', function () {
  let server;
  let superAdmin;

  beforeEach(async function () {
    server = await createServer();
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
  });

  describe('GET /api/certifications/{framework}/info', function () {
    it('returns serialized info of the request framework', async function () {
      domainBuilder.certification.configuration
        .certificationInfoBuilder()
        .asDraft()
        .withParameters({
          framework: SCOPES.CORE,
          assessmentDuration: 200,
          minimumAssessmentLength: 200,
          maximumAssessmentLength: 500,
        })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .certificationInfoBuilder()
        .asActive()
        .withParameters({
          framework: SCOPES.CORE,
          assessmentDuration: 100,
          minimumAssessmentLength: 20,
          maximumAssessmentLength: 50,
        })
        .insertToDB({ databaseBuilder });
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
          'maximum-assessment-length': 50,
        },
      });
    });
  });

  describe('GET /api/admin/certification-versions/{certificationVersionId}', function () {
    it('should return the version details with areas for a given id', async function () {
      // given
      const version = domainBuilder.certification.configuration
        .versionDetailsBuilder()
        .asArchived({ startDate: new Date('2025-01-11'), expirationDate: new Date('2026-01-01') })
        .withLearningContent([
          {
            id: 'areaA',
            code: 'code Domaine A',
            color: 'color Domaine A',
            frameworkId: 'frameworkA',
            title: 'title FR Domaine A',
            competences: [
              {
                id: 'competenceA',
                index: 'index Competence A',
                name: 'name FR Competence A',
                thematics: [
                  {
                    id: 'thematicA',
                    index: 1,
                    name: 'name FR Thematic A',
                    tubes: [
                      {
                        id: 'tubeA',
                        mobile: true,
                        name: 'Titre pratique Tube A',
                        practicalTitle: 'practicalTitle FR Tube A',
                        tablet: false,
                        skills: [
                          {
                            id: 'skillA',
                            difficulty: 2,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ])
        .withParameters({
          scope: SCOPES.CORE,
          id: 123,
          assessmentDuration: 100,
          minimumAnswersRequiredForValidation: 20,
          maximumAssessmentLength: 32,
          challengesBetweenSameCompetence: 2,
          limitToOneQuestionPerTube: true,
          enablePassageByAllCompetences: true,
          variationPercent: 0.5,
          defaultCandidateCapacity: -3,
          defaultProbabilityToPickChallenge: 51,
          comments: 'Some awesome comments',
        })
        .insertToDB({ databaseBuilder });

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
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .asDraft({ startDate: new Date('2025-01-11') })
        .withParameters({
          scope: SCOPES.CORE,
          tubeIds: ['tubeA'],
          id: 123,
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
        })
        .insertToDB({ databaseBuilder });

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
      domainBuilder.certification.configuration
        .versionBuilder()
        .withParameters({
          id: 13,
          comments: 'old comments',
        })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/certification-versions/13/comments`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdmin.id,
        }),
        payload: {
          data: {
            id: 13,
            attributes: {
              comments: 'COUCOU',
            },
            type: 'certification-versions',
          },
        },
      };

      // when
      const response = await server.inject(options);

      const updatedVersion = await knex('certification_versions').where({ id: 13 }).first();

      // then
      expect(response.statusCode).to.equal(204);
      expect(updatedVersion.comments).equal('COUCOU');
    });
  });

  describe('DELETE /api/admin/certification-versions/{id}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      domainBuilder.certification.configuration
        .versionBuilder()
        .asDraft({ startDate: new Date('2021-01-01') })
        .withParameters({
          id: 13,
        })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/admin/certification-versions/13`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const hasVersionBefore = !!(await knex('certification_versions').first());
      const hasVersionTubeBefore = !!(await knex('certification_versions_tubes').first());
      const response = await server.inject(options);

      // then
      const hasVersionAfter = !!(await knex('certification_versions').first());
      const hasVersionTubeAfter = !!(await knex('certification_versions_tubes').first());
      expect(response.statusCode).to.equal(204);
      expect(hasVersionBefore).to.be.true;
      expect(hasVersionTubeBefore).to.be.true;
      expect(hasVersionAfter).to.be.false;
      expect(hasVersionTubeAfter).to.be.false;
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
      domainBuilder.certification.configuration.versionDetailsBuilder().insertLearningContentToDB({
        databaseBuilder,
        areas: [
          {
            id: 'areaA',
            code: 'code Domaine A',
            color: 'color Domaine A',
            frameworkId: 'frameworkA',
            title: 'title FR Domaine A',
            competences: [
              {
                id: 'competenceA',
                index: 'index Competence A',
                name: 'name FR Competence A',
                thematics: [
                  {
                    id: 'thematicA',
                    index: 1,
                    name: 'name FR Thematic A',
                    tubes: [
                      {
                        id: 'tubeA',
                        mobile: true,
                        name: 'Titre pratique Tube A',
                        practicalTitle: 'practicalTitle FR Tube A',
                        tablet: false,
                        skills: [
                          {
                            id: 'skillA',
                            difficulty: 2,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      await databaseBuilder.commit();
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
