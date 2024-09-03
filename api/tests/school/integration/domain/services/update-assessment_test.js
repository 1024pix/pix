import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { updateAssessment } from '../../../../../src/school/domain/services/update-assessment.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Usecase | update-assessment', function () {
  describe('#updateAssessment', function () {
    context('when there is no other activity left in the mission', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [Activity.status.SUCCEEDED, Activity.status.FAILED, Activity.status.SKIPPED].forEach((terminatedStatus) =>
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

      it('should update mission assessment result', async function () {
        const { assessmentId } = databaseBuilder.factory.buildMissionAssessment();
        databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.VALIDATION,
          status: Activity.status.SUCCEEDED,
        });
        const lastActivity = databaseBuilder.factory.buildActivity({
          assessmentId,
          level: Activity.levels.CHALLENGE,
          status: Activity.status.SUCCEEDED,
        });
        await databaseBuilder.commit();

        await updateAssessment({
          assessmentId,
          lastActivity,
          assessmentRepository,
          activityRepository,
          missionAssessmentRepository,
        });

        const missionAssessment = await knex('mission-assessments').where({ assessmentId }).first();
        expect(missionAssessment.result).to.deep.equal(Assessment.results.EXCEEDED);
      });
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
          assessmentRepository,
        });

        const assessment = await knex('assessments').where({ id: assessmentId }).first();
        expect(assessment.state).to.deep.equal(Assessment.states.STARTED);
      });
    });
  });
});
