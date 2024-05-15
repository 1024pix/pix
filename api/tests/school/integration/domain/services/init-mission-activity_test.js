import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { initMissionActivity } from '../../../../../src/school/domain/services/init-mission-activity.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, domainBuilder, expect, knex, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | Usecase | init-mission-activity', function () {
  describe('#initMissionActivity', function () {
    context('when last activity is STARTED', function () {
      it('should not create any activity', async function () {
        const { assessmentId } = databaseBuilder.factory.buildMissionAssessment();
        const lastActivity = domainBuilder.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.STARTED,
        });
        await databaseBuilder.commit();

        const currentActivity = await initMissionActivity({
          assessmentId,
          lastActivity,
          assessmentRepository,
          activityRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        const [{ count: activityCount }] = await knex('activities').count();

        expect(currentActivity).to.deep.equal(lastActivity);
        expect(activityCount).to.equal(0);
      });
    });
    context('when last activity is not STARTED', function () {
      context('when there is no other activities left in the mission', function () {
        it('should not create any activity', async function () {
          const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
          const dbActivity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SUCCEEDED,
          });
          await databaseBuilder.commit();

          mockLearningContent({
            missions: [learningContentBuilder.buildMission({ id: missionId })],
          });

          const lastActivity = domainBuilder.buildActivity(dbActivity);

          const currentActivity = await initMissionActivity({
            assessmentId,
            lastActivity,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          const [{ count: activityCount }] = await knex('activities').count();

          expect(currentActivity).to.deep.equal(lastActivity);
          expect(activityCount).to.equal(1);
        });
      });
      context('when there is at least one activity left in the mission for the current step', function () {
        it('should create activity in the current step', async function () {
          const missionId = 12;
          const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({ missionId });
          const validationActivity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            stepIndex: 0,
            status: Activity.status.FAILED,
            createdAt: new Date('2024-04-01'),
          });
          const trainingActivity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.TRAINING,
            status: Activity.status.FAILED,
            stepIndex: 0,
            alternativeVersion: 0,
            createdAt: new Date('2024-04-02'),
          });
          const tutorialActivity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.TUTORIAL,
            stepIndex: 0,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2024-04-03'),
          });
          await databaseBuilder.commit();

          const lastActivity = domainBuilder.buildActivity(tutorialActivity);

          mockLearningContent({
            missions: [
              learningContentBuilder.buildMission({
                id: missionId,
                content: {
                  steps: [
                    {
                      tutorialChallenges: [['first_di_challenge_id']],
                      validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
                      trainingChallenges: [['first_en_challenge_id_alt1', 'first_en_challenge_id_alt2']],
                    },
                  ],
                  dareChallenges: [['first_de_challenge_id']],
                },
              }),
            ],
          });

          const currentActivity = await initMissionActivity({
            lastActivity,
            assessmentId,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          const existingActivities = [validationActivity.id, tutorialActivity.id, trainingActivity.id];
          const [{ count: activityCount }] = await knex('activities').count();

          expect(activityCount).to.equal(existingActivities.length + 1);
          expect(currentActivity.assessmentId).to.equal(assessmentId);
          expect(currentActivity.level).to.equal(Activity.levels.TRAINING);
          expect(currentActivity.stepIndex).to.equal(0);
          expect(currentActivity.status).to.equal(Activity.status.STARTED);
          expect(currentActivity.alternativeVersion).to.equal(1);
        });
      });
      context('when there is at least one activity left in the mission for the next step', function () {
        it('should create activity in the next step', async function () {
          const missionId = 12;
          const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({ missionId });
          const firstStepValidationActivity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            stepIndex: 0,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2024-04-01'),
          });
          await databaseBuilder.commit();

          const lastActivity = domainBuilder.buildActivity(firstStepValidationActivity);

          mockLearningContent({
            missions: [
              learningContentBuilder.buildMission({
                id: missionId,
                content: {
                  steps: [
                    {
                      validationChallenges: [['first_va_challenge_id']],
                    },
                    {
                      validationChallenges: [['second_va_challenge_id']],
                    },
                  ],
                },
              }),
            ],
          });

          const currentActivity = await initMissionActivity({
            lastActivity,
            assessmentId,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          const [{ count: activityCount }] = await knex('activities').count();

          expect(activityCount).to.equal(2);
          expect(currentActivity.assessmentId).to.equal(assessmentId);
          expect(currentActivity.level).to.equal(Activity.levels.VALIDATION);
          expect(currentActivity.stepIndex).to.equal(1);
          expect(currentActivity.status).to.equal(Activity.status.STARTED);
          expect(currentActivity.alternativeVersion).to.equal(0);
        });
      });
    });
    context('when last activity is undefined', function () {
      it('should create activity', async function () {
        const missionId = 12;
        const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({ missionId });
        await databaseBuilder.commit();

        mockLearningContent({
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                steps: [
                  {
                    tutorialChallenges: [['first_di_challenge_id']],
                    validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
                    trainingChallenges: [['first_en_challenge_id_alt1', 'first_en_challenge_id_alt2']],
                  },
                ],
                dareChallenges: [['first_de_challenge_id']],
              },
            }),
          ],
        });

        const currentActivity = await initMissionActivity({
          lastActivity: undefined,
          assessmentId,
          assessmentRepository,
          activityRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        const [{ count: activityCount }] = await knex('activities').count();
        expect(activityCount).to.equal(1);

        expect(currentActivity.assessmentId).to.equal(assessmentId);
        expect(currentActivity.status).to.equal(Activity.status.STARTED);
        expect(currentActivity.stepIndex).to.equal(0);
      });
    });
  });
});
