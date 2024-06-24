import { Assessment } from '../../../../../lib/domain/models/index.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { MissionLearner } from '../../../../../src/school/domain/models/MissionLearner.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Usecase | find-paginated-mission-learners', function () {
  describe('#findPaginatedMissionLearners', function () {
    it('should return mission learners with mission progress status', async function () {
      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });

      const organizationLearnerWithoutAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });
      const organizationLearnerWithStartedAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });
      const organizationLearnerWithCompletedAssessment =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner({
          organizationId: organization.id,
        });

      const startedAssessment = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.STARTED,
      });
      const completedAssessment = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      });

      const missionId = 1;
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithStartedAssessment.id,
        assessmentId: startedAssessment.id,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithCompletedAssessment.id,
        assessmentId: completedAssessment.id,
      });
      databaseBuilder.factory.buildActivity({
        assessmentId: completedAssessment.id,
        level: Activity.levels.VALIDATION,
        status: Activity.status.SUCCEEDED,
        stepIndex: 0,
      });
      databaseBuilder.factory.buildActivity({
        assessmentId: completedAssessment.id,
        level: Activity.levels.CHALLENGE,
        status: Activity.status.SKIPPED,
      });
      await databaseBuilder.commit();

      const page = {
        page: 1,
        pageCount: 1,
        pageSize: 50,
        rowCount: 1,
      };
      const result = await usecases.findPaginatedMissionLearners({
        organizationId: organization.id,
        missionId,
        page,
      });

      expect(result).to.deep.equal({
        missionLearners: [
          new MissionLearner({
            ...organizationLearnerWithoutAssessment,
            division: 'CM2A',
            status: 'not-started',
            result: undefined,
          }),
          new MissionLearner({
            ...organizationLearnerWithStartedAssessment,
            division: 'CM2A',
            status: 'started',
            result: undefined,
          }),
          new MissionLearner({
            ...organizationLearnerWithCompletedAssessment,
            division: 'CM2A',
            status: 'completed',
            result: 'reached',
          }),
        ],
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 3,
        },
      });
    });
  });
});
