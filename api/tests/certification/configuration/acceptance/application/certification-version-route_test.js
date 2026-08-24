import sinon from 'sinon';

import {
  CALIBRATION_SCOPES,
  CALIBRATION_STATUSES,
} from '../../../../../src/certification/configuration/domain/models/Calibration.js';
import {
  ALERT_LEVELS,
  REPORT_LABELS,
} from '../../../../../src/certification/configuration/domain/models/CalibrationReport.js';
import { VERSION_STATUSES } from '../../../../../src/certification/configuration/domain/models/Version.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, datamartBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Certification | Configuration | API | certification-version-route', function () {
  let server;
  let superAdmin;

  beforeEach(async function () {
    server = await getServer();
    superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    await databaseBuilder.commit();
    await datamartBuilder.clean();
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
          globalScoringConfiguration: [
            {
              bounds: {
                min: -8,
                max: -2,
              },
              meshLevel: 0,
            },
          ],
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
          'external-calibration-id': null,
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
          'global-scoring-configuration': [
            {
              bounds: {
                min: -8,
                max: -2,
              },
              meshLevel: 0,
            },
          ],
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
              'external-calibration-id': null,
              'minimum-answers-required-for-validation': 2,
              'maximum-assessment-length': 3,
              'challenges-between-same-competence': 4,
              'default-probability-to-pick-challenge': 5,
              'variation-percent': 0.6,
              'default-candidate-capacity': 7,
              'limit-to-one-question-per-tube': true,
              'enable-passage-by-all-competences': true,
              'global-scoring-configuration': [
                {
                  bounds: {
                    min: 1,
                    max: 8,
                  },
                  meshLevel: 0,
                },
              ],
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

    it('returns a 422 when globalScoringConfiguration contains bounds where max is lower than or equal to min', async function () {
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
        })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/certification-versions/${version.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            id: version.id,
            attributes: {
              'start-date': new Date('2020-02-02'),
              'assessment-duration': 1,
              'external-calibration-id': null,
              'minimum-answers-required-for-validation': 2,
              'maximum-assessment-length': 3,
              'challenges-between-same-competence': 4,
              'default-probability-to-pick-challenge': 5,
              'variation-percent': 0.6,
              'default-candidate-capacity': 7,
              'limit-to-one-question-per-tube': true,
              'enable-passage-by-all-competences': true,
              'global-scoring-configuration': [{ bounds: { min: 5, max: 2 }, meshLevel: 0 }],
            },
            type: 'certification-versions',
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(422);
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

    beforeEach(function () {
      sinon.useFakeTimers({ now, toFake: ['Date'] });
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
          'external-calibration-id': null,
          'start-date': null,
          'global-scoring-configuration': [],
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

  describe('GET /api/admin/certification-versions/{certificationVersionId}/latest-calibration-report', function () {
    const now = new Date('2025-06-15T12:00:00Z');

    beforeEach(function () {
      sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    it('should return 200 HTTP status code and the report of the latest calibration of the version scope', async function () {
      domainBuilder.certification.configuration
        .versionBuilder()
        .withParameters({ id: 1, scope: SCOPES.CORE, tubeIds: ['tubeA'] })
        .insertToDB({ databaseBuilder });

      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .onScope({ scope: CALIBRATION_SCOPES.CORE })
        .withCalibratredChallenges([{ challengeId: 'challengeA', tubeId: 'tubeA' }])
        .asValidated({ startedAt: new Date('2021-01-01') })
        .withParameters({ id: 2 })
        .insertToDB({ datamartBuilder });

      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .onScope({ scope: CALIBRATION_SCOPES.CORE })
        .asValidated({ startedAt: new Date('2020-01-01') })
        .withParameters({ id: 3 })
        .insertToDB({ datamartBuilder });

      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .onScope({ scope: CALIBRATION_SCOPES.DROIT })
        .asValidated({ startedAt: new Date('2025-01-01') })
        .withParameters({ id: 4 })
        .insertToDB({ datamartBuilder });

      const learningContent = {
        skills: [
          {
            id: 'skillA',
            tubeId: 'tubeA',
          },
        ],
        challenges: [
          {
            id: 'challengeA',
            skillId: 'skillA',
            locales: ['fr', 'en'],
          },
        ],
      };
      databaseBuilder.factory.learningContent.build(learningContent);

      await databaseBuilder.commit();
      await datamartBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/certification-versions/1/latest-calibration-report`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'calibration-reports',
        id: '1_2',
        attributes: {
          'calibration-id': 2,
          'generated-at': new Date(),
          'report-lines': [
            {
              additionalContent: null,
              alertLevel: null,
              content: 1,
              label: REPORT_LABELS.CALIBRATED_CHALLENGE_COUNT,
            },
            {
              additionalContent: null,
              alertLevel: null,
              content: 1,
              label: REPORT_LABELS.ENGLISH_CALIBRATED_CHALLENGE_COUNT,
            },
            {
              additionalContent: "La calibration a été démarrée depuis plus d'1 an",
              alertLevel: ALERT_LEVELS.HIGH,
              content: new Date('2021-01-01'),
              label: REPORT_LABELS.CALIBRATION_STARTED_AT,
            },
            {
              additionalContent: null,
              alertLevel: null,
              content: SCOPES.CORE,
              label: REPORT_LABELS.CALIBRATION_SCOPE,
            },
            {
              additionalContent: null,
              alertLevel: null,
              content: CALIBRATION_STATUSES.VALIDATED,
              label: REPORT_LABELS.CALIBRATION_STATUS,
            },
            {
              additionalContent: 'Aucun scoring par maille validé trouvé pour cette calibration',
              alertLevel: ALERT_LEVELS.HIGH,
              content: false,
              label: REPORT_LABELS.MESH_SCORING_PRESENCE,
            },
            {
              additionalContent: 'Aucun scoring par compétence validé trouvé pour cette calibration',
              alertLevel: ALERT_LEVELS.HIGH,
              content: false,
              label: REPORT_LABELS.COMPETENCE_SCORING_PRESENCE,
            },
          ],
        },
      });
    });
  });

  describe('GET /api/admin/calibrations/{calibrationId}/scoring-configuration', function () {
    it('returns the global scoring configuration proposed by the calibration', async function () {
      // given
      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .onScope({ scope: CALIBRATION_SCOPES.CORE })
        .asValidated({ startedAt: new Date('2026-03-04') })
        .withParameters({ id: 2 })
        .withScoringMeshes([
          { mesh: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 },
          { mesh: 1, minBoundCuratedValue: -1.4, maxBoundCuratedValue: 0.6 },
        ])
        .withScoringThresholds([
          { competenceId: 'comp1', level: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 },
          { competenceId: 'comp1', level: 1, minBoundCuratedValue: -1.4, maxBoundCuratedValue: 0.6 },
          { competenceId: 'comp2', level: 0, minBoundCuratedValue: -4.67, maxBoundCuratedValue: -1.4 },
          { competenceId: 'comp2', level: 1, minBoundCuratedValue: -1.4, maxBoundCuratedValue: 0.6 },
        ])
        .insertToDB({ datamartBuilder });

      await databaseBuilder.commit();
      await datamartBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/calibrations/2/scoring-configuration`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'calibration-scoring-configurations',
        id: '2',
        attributes: {
          'calibration-id': 2,
          'global-scoring-configuration': [
            { meshLevel: 0, bounds: { min: -4.67, max: -1.4 } },
            { meshLevel: 1, bounds: { min: -1.4, max: 0.6 } },
          ],
          'competences-scoring-configuration': [
            {
              competenceId: 'comp1',
              values: [
                { competenceLevel: 0, bounds: { min: -4.67, max: -1.4 } },
                { competenceLevel: 1, bounds: { min: -1.4, max: 0.6 } },
              ],
            },
            {
              competenceId: 'comp2',
              values: [
                { competenceLevel: 0, bounds: { min: -4.67, max: -1.4 } },
                { competenceLevel: 1, bounds: { min: -1.4, max: 0.6 } },
              ],
            },
          ],
        },
      });
    });

    it('returns a 200 with an empty configuration when Data has not delivered the meshes', async function () {
      // given
      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .onScope({ scope: CALIBRATION_SCOPES.CORE })
        .asValidated({ startedAt: new Date('2026-03-04') })
        .withParameters({ id: 2 })
        .insertToDB({ datamartBuilder });

      await databaseBuilder.commit();
      await datamartBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/calibrations/2/scoring-configuration`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes).to.deep.equal({
        'calibration-id': 2,
        'global-scoring-configuration': [],
        'competences-scoring-configuration': [],
      });
    });

    it('returns a 404 when the calibration does not exist', async function () {
      // given
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/calibrations/404/scoring-configuration`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('returns a 403 when the user is not a super admin', async function () {
      // given
      const certifUser = databaseBuilder.factory.buildUser.withRole({ role: 'CERTIF' });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/calibrations/2/scoring-configuration`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: certifUser.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/admin/certification-versions/{certificationVersionId}/activation', function () {
    it('activates the draft version, archives the active one, and persists calibrated challenges', async function () {
      // given
      const activeVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2024-01-01') })
        .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'], id: 10 })
        .insertToDB({ databaseBuilder });
      const draftVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asDraft({ startDate: new Date('2025-01-01') })
        .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'], id: 11, externalCalibrationId: 2 })
        .insertToDB({ databaseBuilder });

      await domainBuilder.certification.configuration
        .calibrationBuilder()
        .onScope({ scope: CALIBRATION_SCOPES.COEUR })
        .withCalibratredChallenges([{ challengeId: 'challengeA', tubeId: 'tubeA' }])
        .asValidated({ startedAt: new Date('2024-06-01') })
        .withParameters({ id: 2 })
        .insertToDB({ datamartBuilder });

      databaseBuilder.factory.learningContent.build({
        skills: [{ id: 'skillA', tubeId: 'tubeA' }],
        challenges: [{ id: 'challengeA', skillId: 'skillA' }],
      });

      await databaseBuilder.commit();
      await datamartBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/certification-versions/${draftVersion.id}/activation`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);

      const activatedVersion = await knex('certification_versions').where({ id: draftVersion.id }).first();
      expect(activatedVersion.status).to.equal(VERSION_STATUSES.ACTIVE);

      const archivedVersion = await knex('certification_versions').where({ id: activeVersion.id }).first();
      expect(archivedVersion.status).to.equal(VERSION_STATUSES.ARCHIVED);

      const savedChallenges = await knex('certification-frameworks-challenges').where({ versionId: draftVersion.id });
      expect(savedChallenges).to.have.lengthOf(1);
      expect(savedChallenges[0].challengeId).to.equal('challengeA');
    });
  });
});
