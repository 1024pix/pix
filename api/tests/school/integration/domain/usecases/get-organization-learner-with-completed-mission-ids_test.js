import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import { Assessment } from '../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Usecase | get-organization-learner-with-completed-mission-ids', function () {
  describe('#getOrganizationLearnerWithMissionIdsByState', function () {
    it('should return organization learner with mission ids by state', async function () {
      const organizationLearner =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner();
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

      const result = await usecases.getOrganizationLearnerWithMissionIdsByState({
        organizationLearnerId: organizationLearner.id,
      });

      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          division: organizationLearner.attributes['Libellé classe'],
          completedMissionIds: [completedMissionId],
          startedMissionIds: [startedMissionId],
        }),
      );
    });

    it('should return only the good organization learner', async function () {
      const organizationLearner =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner();

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
      const otherOrganizationLearner =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner();

      const otherCompletedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      }).id;
      databaseBuilder.factory.buildMissionAssessment({
        missionId: otherCompletedMissionId,
        organizationLearnerId: otherOrganizationLearner.id,
        assessmentId: otherCompletedAssessmentId,
      });
      await databaseBuilder.commit();

      const result = await usecases.getOrganizationLearnerWithMissionIdsByState({
        organizationLearnerId: organizationLearner.id,
      });
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          division: organizationLearner.attributes['Libellé classe'],
          completedMissionIds: [completedMissionId],
        }),
      );
    });

    it('should return organization learner even without missions', async function () {
      const organizationLearner =
        databaseBuilder.factory.prescription.organizationLearners.buildOndeOrganizationLearner();

      await databaseBuilder.commit();

      const result = await usecases.getOrganizationLearnerWithMissionIdsByState({
        organizationLearnerId: organizationLearner.id,
      });
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          division: organizationLearner.attributes['Libellé classe'],
        }),
      );
    });
  });
});
