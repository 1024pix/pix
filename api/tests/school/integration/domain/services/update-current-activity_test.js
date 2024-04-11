import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { updateCurrentActivity } from '../../../../../src/school/domain/services/update-current-activity.js';
import * as activityAnswerRepository from '../../../../../src/school/infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { databaseBuilder, expect, knex, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | UseCase | update current activity', function () {
  context('when last answer is ko', function () {
    it('should update current activity with FAILED status', async function () {
      const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
      const { id: activityId } = databaseBuilder.factory.buildActivity({
        assessmentId,
        status: Activity.status.STARTED,
      });
      databaseBuilder.factory.buildActivityAnswer({
        activityId,
        challengeId: 'va_challenge_id',
        result: AnswerStatus.statuses.KO,
      });

      mockLearningContent({
        missions: [
          learningContentBuilder.buildMission({
            id: missionId,
            content: {
              validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
            },
          }),
        ],
      });

      await databaseBuilder.commit();

      const currentActivity = await updateCurrentActivity({
        assessmentId,
        activityRepository,
        activityAnswerRepository,
        missionAssessmentRepository,
        missionRepository,
      });

      const activities = await knex('activities').where({ assessmentId });
      expect(activities.length).to.equal(1);
      expect(activities[0].status).to.equal(Activity.status.FAILED);
      expect(currentActivity.status).equals(Activity.status.FAILED);
    });
  });
  context('when last answer is ok', function () {
    context('when activity is not finished', function () {
      it('should not update current activity status', async function () {
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
        const { id: activityId } = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId,
          challengeId: 'va_challenge_id',
          result: AnswerStatus.statuses.OK,
        });

        await databaseBuilder.commit();

        mockLearningContent({
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
              },
            }),
          ],
        });

        const currentActivity = await updateCurrentActivity({
          assessmentId,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        const activities = await knex('activities').where({ assessmentId });
        expect(activities.length).to.equal(1);
        expect(activities[0].status).to.equal(Activity.status.STARTED);
        expect(currentActivity.status).equals(Activity.status.STARTED);
      });
    });

    context('when activity is finished', function () {
      it('should update current activity with SUCCEEDED status', async function () {
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
        const { id: activityId } = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId,
          challengeId: 'va_challenge_id',
          result: AnswerStatus.statuses.OK,
        });
        databaseBuilder.factory.buildActivityAnswer({
          activityId,
          challengeId: 'va_next_challenge_id',
          result: AnswerStatus.statuses.OK,
        });

        await databaseBuilder.commit();

        mockLearningContent({
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
              },
            }),
          ],
        });

        const currentActivity = await updateCurrentActivity({
          assessmentId,
          activityRepository,
          activityAnswerRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        const activities = await knex('activities').where({ assessmentId });
        expect(activities.length).to.equal(1);
        expect(activities[0].status).to.equal(Activity.status.SUCCEEDED);
        expect(currentActivity.status).equals(Activity.status.SUCCEEDED);
      });
    });
  });
  context('when challenge has been skipped', function () {
    it('should update current activity with SKIPPED status', async function () {
      const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
      const { id: activityId } = databaseBuilder.factory.buildActivity({
        assessmentId,
        level: Activity.levels.VALIDATION,
        status: Activity.status.STARTED,
      });
      databaseBuilder.factory.buildActivityAnswer({
        activityId,
        challengeId: 'va_challenge_id',
        result: AnswerStatus.statuses.SKIPPED,
      });
      await databaseBuilder.commit();

      mockLearningContent({
        missions: [
          learningContentBuilder.buildMission({
            id: missionId,
            content: {
              validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
            },
          }),
        ],
      });

      const currentActivity = await updateCurrentActivity({
        assessmentId,
        activityRepository,
        activityAnswerRepository,
        missionAssessmentRepository,
        missionRepository,
      });

      const activities = await knex('activities').where({ assessmentId });
      expect(activities.length).to.equal(1);
      expect(activities[0].status).to.equal(Activity.status.SKIPPED);
      expect(currentActivity.status).equals(Activity.status.SKIPPED);
    });
  });
});
