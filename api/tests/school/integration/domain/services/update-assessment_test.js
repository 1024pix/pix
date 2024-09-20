import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { updateAssessment } from '../../../../../src/school/domain/services/update-assessment.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Usecase | update-assessment', function () {
  describe('#updateAssessment', function () {
    context('when the mission is over', function () {
      context('when the learner was in a step and not in dare', function () {
        it('should update step result', async function () {
          const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({
            result: { global: undefined, steps: [Assessment.results.REACHED] },
          });
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2020-01-01'),
            stepIndex: 1,
          });
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.FAILED,
            createdAt: new Date('2020-01-02'),
            stepIndex: 2,
          });
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.TUTORIAL,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2020-01-03'),
            stepIndex: 2,
          });
          const lastActivity = new Activity(
            databaseBuilder.factory.buildActivity({
              assessmentId,
              level: Activity.levels.VALIDATION,
              status: Activity.status.FAILED,
              createdAt: new Date('2020-01-04'),
              stepIndex: 2,
            }),
          );
          await databaseBuilder.commit();
          await updateAssessment({
            assessmentId,
            lastActivity,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
          });

          const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
          expect(missionAssessment.result.steps).to.deep.equal([
            Assessment.results.REACHED,
            Assessment.results.PARTIALLY_REACHED,
          ]);
        });
      });

      context('when the learner was in a dare and not in a step', function () {
        it('should update dare result', async function () {
          const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({
            result: { steps: [Assessment.results.REACHED] },
          });
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2020-01-01'),
            stepIndex: 1,
          });
          const lastActivity = new Activity(
            databaseBuilder.factory.buildActivity({
              assessmentId,
              level: Activity.levels.CHALLENGE,
              status: Activity.status.SUCCEEDED,
              createdAt: new Date('2020-01-02'),
            }),
          );
          await databaseBuilder.commit();
          await updateAssessment({
            assessmentId,
            lastActivity,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
          });

          const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
          expect(missionAssessment.result).to.deep.equal({
            global: Assessment.results.EXCEEDED,
            dare: Assessment.results.REACHED,
            steps: [Assessment.results.REACHED],
          });
        });
      });

      it('should update mission assessment global result', async function () {
        const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({
          result: {
            steps: [Assessment.results.REACHED],
          },
        });
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.SUCCEEDED,
          createdAt: new Date('2020-01-01'),
        });

        const lastActivity = new Activity(
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.CHALLENGE,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2020-01-02'),
          }),
        );
        await databaseBuilder.commit();

        await updateAssessment({
          assessmentId,
          lastActivity,
          assessmentRepository,
          activityRepository,
          missionAssessmentRepository,
        });

        const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
        expect(missionAssessment.result.global).to.deep.equal(Assessment.results.EXCEEDED);
      });

      // eslint-disable-next-line mocha/no-setup-in-describe
      [(Activity.status.SUCCEEDED, Activity.status.FAILED, Activity.status.SKIPPED)].forEach((terminatedStatus) =>
        it(`should complete assessment when last activity status is ${terminatedStatus}`, async function () {
          const { assessmentId } = databaseBuilder.factory.buildMissionAssessment();
          await databaseBuilder.commit();

          const lastActivity = domainBuilder.buildActivity({
            assessmentId,
            level: Activity.levels.CHALLENGE,
            status: terminatedStatus,
          });

          await updateAssessment({
            assessmentId,
            lastActivity,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
          });

          const assessment = await knex('assessments').where({ id: assessmentId }).first();
          expect(assessment.state).to.deep.equal(Assessment.states.COMPLETED);
        }),
      );
    });

    context('when there is at least one activity left in the mission', function () {
      it('should leave assessment STARTED', async function () {
        const { assessmentId } = databaseBuilder.factory.buildMissionAssessment();
        const lastActivity = domainBuilder.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.STARTED,
        });
        await databaseBuilder.commit();

        await updateAssessment({
          assessmentId,
          lastActivity,
          activityRepository,
          assessmentRepository,
          missionAssessmentRepository,
        });

        const assessment = await knex('assessments').where({ id: assessmentId }).first();
        expect(assessment.state).to.deep.equal(Assessment.states.STARTED);
      });

      context('when previous step has just finished', function () {
        it('should update mission assessment previous step result', async function () {
          const { assessmentId } = databaseBuilder.factory.buildMissionAssessment();
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2020-01-01'),
            stepIndex: 1,
          });
          const lastActivity = new Activity(
            databaseBuilder.factory.buildActivity({
              assessmentId,
              level: Activity.levels.VALIDATION,
              status: Activity.status.STARTED,
              stepIndex: 2,
              createdAt: new Date('2020-01-02'),
            }),
          );
          await databaseBuilder.commit();

          await updateAssessment({
            assessmentId,
            lastActivity,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
          });

          const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
          expect(missionAssessment.result.steps).to.deep.equal([Assessment.results.REACHED]);
        });

        it('should update mission assessment previous step result even if current activity is challenge (Dare)', async function () {
          const { assessmentId } = databaseBuilder.factory.buildMissionAssessment();
          databaseBuilder.factory.buildActivity({
            assessmentId,
            level: Activity.levels.VALIDATION,
            status: Activity.status.SUCCEEDED,
            createdAt: new Date('2020-01-01'),
            stepIndex: 0,
          });
          const lastActivity = new Activity(
            databaseBuilder.factory.buildActivity({
              assessmentId,
              level: Activity.levels.CHALLENGE,
              status: Activity.status.STARTED,
              createdAt: new Date('2020-01-02'),
            }),
          );
          await databaseBuilder.commit();

          await updateAssessment({
            assessmentId,
            lastActivity,
            assessmentRepository,
            activityRepository,
            missionAssessmentRepository,
          });

          const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
          expect(missionAssessment.result.steps).to.deep.equal([Assessment.results.REACHED]);
        });
      });

      context('when previous activity is in the same step as current activity', function () {
        context('when current activity is in first step', function () {
          it('should not exist any mission assessment result', async function () {
            const { assessmentId } = databaseBuilder.factory.buildMissionAssessment();
            databaseBuilder.factory.buildActivity({
              assessmentId,
              level: Activity.levels.VALIDATION,
              status: Activity.status.FAILED,
              createdAt: new Date('2020-01-01'),
              stepIndex: 1,
            });
            const lastActivity = new Activity(
              databaseBuilder.factory.buildActivity({
                assessmentId,
                level: Activity.levels.TRAINING,
                status: Activity.status.STARTED,
                createdAt: new Date('2020-01-02'),
                stepIndex: 1,
              }),
            );
            await databaseBuilder.commit();

            await updateAssessment({
              assessmentId,
              lastActivity,
              assessmentRepository,
              activityRepository,
              missionAssessmentRepository,
            });

            const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
            expect(missionAssessment.result).to.be.null;
          });
        });
        context('when current step is after first step', function () {
          it('should not update mission assessment result', async function () {
            const missionAssessmentResult = { steps: [Assessment.results.REACHED] };
            const { assessmentId } = databaseBuilder.factory.buildMissionAssessment({
              result: missionAssessmentResult,
            });
            databaseBuilder.factory.buildActivity({
              assessmentId,
              level: Activity.levels.VALIDATION,
              status: Activity.status.SUCCEEDED,
              createdAt: new Date('2020-01-01'),
              stepIndex: 1,
            });
            databaseBuilder.factory.buildActivity({
              assessmentId,
              level: Activity.levels.VALIDATION,
              status: Activity.status.FAILED,
              createdAt: new Date('2020-01-02'),
              stepIndex: 2,
            });
            const lastActivity = new Activity(
              databaseBuilder.factory.buildActivity({
                assessmentId,
                level: Activity.levels.TRAINING,
                status: Activity.status.STARTED,
                createdAt: new Date('2020-01-03'),
                stepIndex: 2,
              }),
            );
            await databaseBuilder.commit();

            await updateAssessment({
              assessmentId,
              lastActivity,
              assessmentRepository,
              activityRepository,
              missionAssessmentRepository,
            });

            const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
            expect(missionAssessment.result).to.deep.equal(missionAssessmentResult);
          });
        });
      });
    });
  });
});
