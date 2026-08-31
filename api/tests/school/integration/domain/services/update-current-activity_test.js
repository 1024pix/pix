import { expect } from 'chai';

import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { ActivityAnswer } from '../../../../../src/school/domain/models/ActivityAnswer.js';
import { updateCurrentActivity } from '../../../../../src/school/domain/services/update-current-activity.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | UseCase | update current activity', function () {
  context('when activity level is tutorial', function () {
    context('when activity is not finished', function () {
      [
        { message: 'correctly answered', result: AnswerStatus.statuses.OK },
        { message: 'wrongly answered', result: AnswerStatus.statuses.KO },
        { message: 'skipped', result: AnswerStatus.statuses.SKIPPED },
      ].forEach(({ message, result }) =>
        it(`should not update current activity status when challenge is ${message}`, async function () {
          const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
          const activity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.TUTORIAL,
            status: Activity.status.STARTED,
            stepIndex: 0,
          });
          const lastActivity = new Activity(activity);
          const lastAnswer = new ActivityAnswer({
            activityId: lastActivity.id,
            challengeId: 'di_challenge_id',
            result,
          });

          databaseBuilder.factory.learningContent.build({
            missions: [
              learningContentBuilder.buildMission({
                id: missionId,
                content: {
                  steps: [
                    {
                      tutorialChallenges: [['di_challenge_id'], ['di_next_challenge_id']],
                    },
                  ],
                },
              }),
            ],
          });
          await databaseBuilder.commit();

          const currentActivity = await updateCurrentActivity({
            assessmentId,
            lastActivity,
            lastAnswer,
            activityRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          const activities = await knex('activities').where({ assessmentId });
          expect(activities).to.have.lengthOf(1);
          expect(activities[0].status).to.equal(Activity.status.STARTED);
          expect(currentActivity.status).equals(Activity.status.STARTED);
        }),
      );
    });

    context('when activity is finished', function () {
      [
        { message: 'correctly answered', result: AnswerStatus.statuses.OK },

        { message: 'wrongly answered', result: AnswerStatus.statuses.KO },

        { message: 'skipped', result: AnswerStatus.statuses.SKIPPED },
      ].forEach(({ message, result }) =>
        it(`should update current activity with SUCCEEDED status when challenge is ${message}`, async function () {
          const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
          const activity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.TUTORIAL,
            status: Activity.status.STARTED,
            stepIndex: 0,
          });
          const lastActivity = new Activity(activity);
          const lastAnswer = new ActivityAnswer({
            activityId: lastActivity.id,
            challengeId: 'di_next_challenge_id',
            result,
          });

          databaseBuilder.factory.learningContent.build({
            missions: [
              learningContentBuilder.buildMission({
                id: missionId,
                content: {
                  steps: [
                    {
                      tutorialChallenges: [['di_challenge_id'], ['di_next_challenge_id']],
                    },
                  ],
                },
              }),
            ],
          });
          await databaseBuilder.commit();

          const currentActivity = await updateCurrentActivity({
            assessmentId,
            lastActivity,
            lastAnswer,
            activityRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          const activities = await knex('activities').where({ assessmentId });
          expect(activities).to.have.lengthOf(1);
          expect(activities[0].status).to.equal(Activity.status.SUCCEEDED);
          expect(currentActivity.status).equals(Activity.status.SUCCEEDED);
        }),
      );
    });
  });

  context('when activity level is not tutorial', function () {
    context('when last answer is ko', function () {
      it('should update current activity with FAILED status', async function () {
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
        const lastActivity = databaseBuilder.factory.buildActivity({
          assessmentId,
          status: Activity.status.STARTED,
          level: Activity.levels.VALIDATION,
          stepIndex: 0,
        });
        const lastAnswer = new ActivityAnswer({
          activityId: lastActivity.id,
          challengeId: 'va_challenge_id',
          result: AnswerStatus.statuses.KO,
        });

        databaseBuilder.factory.learningContent.build({
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                steps: [
                  {
                    validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
                  },
                ],
              },
            }),
          ],
        });

        await databaseBuilder.commit();

        const currentActivity = await updateCurrentActivity({
          assessmentId,
          lastActivity,
          lastAnswer,
          activityRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        const activities = await knex('activities').where({ assessmentId });
        expect(activities).to.have.lengthOf(1);
        expect(activities[0].status).to.equal(Activity.status.FAILED);
        expect(currentActivity.status).equals(Activity.status.FAILED);
      });
    });

    context('when last answer is ok', function () {
      context('when activity is not finished', function () {
        it('should not update current activity status', async function () {
          const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
          const lastActivity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.STARTED,
            stepIndex: 0,
          });
          const lastAnswer = new ActivityAnswer({
            activityId: lastActivity.id,
            challengeId: 'va_challenge_id',
            result: AnswerStatus.statuses.OK,
          });

          databaseBuilder.factory.learningContent.build({
            missions: [
              learningContentBuilder.buildMission({
                id: missionId,
                content: {
                  steps: [
                    {
                      validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
                    },
                  ],
                },
              }),
            ],
          });
          await databaseBuilder.commit();

          const currentActivity = await updateCurrentActivity({
            assessmentId,
            lastActivity,
            lastAnswer,
            activityRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          const activities = await knex('activities').where({ assessmentId });
          expect(activities).to.have.lengthOf(1);
          expect(activities[0].status).to.equal(Activity.status.STARTED);
          expect(currentActivity.status).equals(Activity.status.STARTED);
        });
      });

      context('when activity is finished', function () {
        it('should update current activity with SUCCEEDED status', async function () {
          const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
          const lastActivity = databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.STARTED,
            stepIndex: 0,
          });
          const lastAnswer = new ActivityAnswer({
            activityId: lastActivity.id,
            challengeId: 'va_next_challenge_id',
            result: AnswerStatus.statuses.OK,
          });

          databaseBuilder.factory.learningContent.build({
            missions: [
              learningContentBuilder.buildMission({
                id: missionId,
                content: {
                  steps: [
                    {
                      validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
                    },
                  ],
                },
              }),
            ],
          });
          await databaseBuilder.commit();

          const currentActivity = await updateCurrentActivity({
            assessmentId,
            lastActivity,
            lastAnswer,
            activityRepository,
            missionAssessmentRepository,
            missionRepository,
          });

          const activities = await knex('activities').where({ assessmentId });
          expect(activities).to.have.lengthOf(1);
          expect(activities[0].status).to.equal(Activity.status.SUCCEEDED);
          expect(currentActivity.status).equals(Activity.status.SUCCEEDED);
        });
      });
    });

    context('when challenge has been skipped', function () {
      it('should update current activity with SKIPPED status', async function () {
        const { assessmentId, missionId } = databaseBuilder.factory.buildMissionAssessment();
        const lastActivity = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
          stepIndex: 0,
        });
        const lastAnswer = new ActivityAnswer({
          activityId: lastActivity.id,
          challengeId: 'va_challenge_id',
          result: AnswerStatus.statuses.SKIPPED,
        });

        databaseBuilder.factory.learningContent.build({
          missions: [
            learningContentBuilder.buildMission({
              id: missionId,
              content: {
                steps: [
                  {
                    validationChallenges: [['va_challenge_id'], ['va_next_challenge_id']],
                  },
                ],
              },
            }),
          ],
        });
        await databaseBuilder.commit();

        const currentActivity = await updateCurrentActivity({
          assessmentId,
          lastActivity,
          lastAnswer,
          activityRepository,
          missionAssessmentRepository,
          missionRepository,
        });

        const activities = await knex('activities').where({ assessmentId });
        expect(activities).to.have.lengthOf(1);
        expect(activities[0].status).to.equal(Activity.status.SKIPPED);
        expect(currentActivity.status).equals(Activity.status.SKIPPED);
      });
    });
  });
});
