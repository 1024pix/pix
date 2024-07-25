import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { createServer, databaseBuilder, expect, knex, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Acceptance | Controller | assessment-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /assessments/{id}/current-activity', function () {
    context('when the assessment is completed', function () {
      it('should return a 412 HTTP status code for PreconditionFailedError', async function () {
        // given
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.PIX1D_MISSION,
          state: Assessment.states.COMPLETED,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/pix1d/assessments/${assessmentId}/current-activity`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });

    context('when the assessment is in progress', function () {
      it('should return current-activity', async function () {
        // given
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.PIX1D_MISSION,
          state: Assessment.states.STARTED,
        });
        const { id: activityId } = databaseBuilder.factory.buildActivity({ assessmentId });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/pix1d/assessments/${assessmentId}/current-activity`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.id).to.equal(activityId.toString());
      });
    });
  });

  describe('POST /api/pix1d/assessments', function () {
    context('when there is no assessment in progress for current organization-learner and given mission', function () {
      afterEach(async function () {
        await knex('mission-assessments').truncate();
      });

      it('should create a mission-assessment and return it', async function () {
        const learner = databaseBuilder.factory.buildOrganizationLearner();
        await databaseBuilder.commit();

        const mission = learningContentBuilder.buildMission();

        const learningContent = {
          missions: [mission],
        };

        mockLearningContent(learningContent);

        const postAssessmentRequest = {
          method: 'POST',
          url: `/api/pix1d/assessments`,
          payload: {
            missionId: `${mission.id}`,
            learnerId: learner.id,
          },
        };

        // when
        const response = await server.inject(postAssessmentRequest);

        const lastMissionAssessment = await knex('mission-assessments').select().orderBy('assessmentId').first();

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data).to.deep.equal({
          attributes: {
            'mission-id': mission.id,
            'organization-learner-id': learner.id,
            state: 'started',
          },
          id: `${lastMissionAssessment.assessmentId}`,
          type: 'assessments',
        });
      });
    });

    context('when there is an assessment in progress for given organization-learner and mission', function () {
      it('should retrieve the mission-assessment and return it', async function () {
        const mission = learningContentBuilder.buildMission();

        const learningContent = {
          missions: [mission],
        };

        mockLearningContent(learningContent);

        const learner = databaseBuilder.factory.buildOrganizationLearner();
        const missionAssessment = databaseBuilder.factory.buildMissionAssessment({
          organizationLearnerId: learner.id,
          missionId: mission.id,
        });
        await databaseBuilder.commit();

        const postAssessmentRequest = {
          method: 'POST',
          url: `/api/pix1d/assessments`,
          payload: {
            missionId: `${mission.id}`,
            learnerId: learner.id,
          },
        };

        // when
        const response = await server.inject(postAssessmentRequest);

        // then
        expect(response.result.data).to.deep.equal({
          attributes: {
            'mission-id': mission.id,
            'organization-learner-id': learner.id,
            state: 'started',
          },
          id: `${missionAssessment.assessmentId}`,
          type: 'assessments',
        });
        expect(response.statusCode).to.equal(201);
      });
    });
  });
});
