import { Assessment } from '../../../../../lib/domain/models/index.js';
import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import { getOrganizationLearnerWithCompletedMissionIds } from '../../../../../src/school/domain/usecases/get-organization-learner-with-completed-mission-ids.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as organizationLearnerRepository from '../../../../../src/school/infrastructure/repositories/organization-learner-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Usecase | get-organization-learner-with-completed-mission-ids', function () {
  describe('#getOrganizationLearnerWithCompletedMissionIds', function () {
    it('should return organization learner with completed mission ids', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const completedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      }).id;
      const startedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.STARTED,
      }).id;
      const completedMissionId = 123;
      const startedMissionId = 456;
      databaseBuilder.factory.buildMissionAssessment({
        missionId: completedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: completedAssessmentId,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: startedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: startedAssessmentId,
      });
      await databaseBuilder.commit();
      const result = await getOrganizationLearnerWithCompletedMissionIds({
        organizationLearnerId: organizationLearner.id,
        missionAssessmentRepository,
        organizationLearnerRepository,
      });
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          completedMissionIds: [completedMissionId],
        }),
      );
    });

    it('should return only the good organization learner', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const completedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      }).id;
      const completedMissionId = 456;
      const otherCompletedMissionId = 123;

      databaseBuilder.factory.buildMissionAssessment({
        missionId: completedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: completedAssessmentId,
      });
      const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const otherCompletedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      }).id;
      databaseBuilder.factory.buildMissionAssessment({
        missionId: otherCompletedMissionId,
        organizationLearnerId: otherOrganizationLearner.id,
        assessmentId: otherCompletedAssessmentId,
      });

      await databaseBuilder.commit();
      const result = await getOrganizationLearnerWithCompletedMissionIds({
        organizationLearnerId: organizationLearner.id,
        missionAssessmentRepository,
        organizationLearnerRepository,
      });
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          completedMissionIds: [completedMissionId],
        }),
      );
    });

    it('should return organization learner even without completed missions', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      const result = await getOrganizationLearnerWithCompletedMissionIds({
        organizationLearnerId: organizationLearner.id,
        missionAssessmentRepository,
        organizationLearnerRepository,
      });
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          completedMissionIds: [],
        }),
      );
    });
  });
});
