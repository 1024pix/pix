import { databaseBuilder, expect } from '../../../../test-helper.js';
import { Assessment } from '../../../../../lib/domain/models/index.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { getOrganizationLearnerWithCompletedMissionIds } from '../../../../../src/school/domain/usecases/get-organization-learner-with-completed-mission-ids.js';
import * as organizationLearnersRepository from '../../../../../src/school/infrastructure/repositories/organization-learners-repository.js';
import { OrganizationLearner } from '../../../../../src/school/domain/models/OrganizationLearner.js';

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
      databaseBuilder.factory.buildMissionAssessment({
        missionId: 'COMPLETED_ID',
        organizationLearnerId: organizationLearner.id,
        assessmentId: completedAssessmentId,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: 'STARTED_ID',
        organizationLearnerId: organizationLearner.id,
        assessmentId: startedAssessmentId,
      });
      await databaseBuilder.commit();
      const result = await getOrganizationLearnerWithCompletedMissionIds({
        organizationLearnerId: organizationLearner.id,
        missionAssessmentRepository,
        organizationLearnersRepository,
      });
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          completedMissionIds: ['COMPLETED_ID'],
        }),
      );
    });

    it('should return only the good organization learner', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const completedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      }).id;
      databaseBuilder.factory.buildMissionAssessment({
        missionId: 'COMPLETED_ID',
        organizationLearnerId: organizationLearner.id,
        assessmentId: completedAssessmentId,
      });

      const otherOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const otherCompletedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      }).id;
      databaseBuilder.factory.buildMissionAssessment({
        missionId: 'COMPLETED_ID',
        organizationLearnerId: otherOrganizationLearner.id,
        assessmentId: otherCompletedAssessmentId,
      });

      await databaseBuilder.commit();
      const result = await getOrganizationLearnerWithCompletedMissionIds({
        organizationLearnerId: organizationLearner.id,
        missionAssessmentRepository,
        organizationLearnersRepository,
      });
      expect(result).to.deep.equal(
        new OrganizationLearner({
          ...organizationLearner,
          completedMissionIds: ['COMPLETED_ID'],
        }),
      );
    });

    it('should return organization learner even without completed missions', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      const result = await getOrganizationLearnerWithCompletedMissionIds({
        organizationLearnerId: organizationLearner.id,
        missionAssessmentRepository,
        organizationLearnersRepository,
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
