import { databaseBuilder, expect } from '../../../../test-helper.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { MissionAssessment } from '../../../../../src/school/domain/models/MissionAssessment.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

describe('Integration | Repository | mission-assessment-repository', function () {
  describe('#getByAssessmentId', function () {
    it('returns the missionAssessment corresponding to the assessmentId', async function () {
      const missionId = 'flute78';
      const assessmentId = databaseBuilder.factory.buildPix1dAssessment().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildMissionAssessment({ missionId, assessmentId, organizationLearnerId });
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getByAssessmentId(assessmentId);

      expect(result).to.deep.equal(new MissionAssessment({ missionId, assessmentId, organizationLearnerId }));
    });
  });
  describe('#getAllCompletedMissionIds', function () {
    it('should return a list of completed mission ids for a given organization learner', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const completedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
      }).id;
      const otherCompletedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
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
        missionId: 'OTHER_COMPLETED_ID',
        organizationLearnerId: organizationLearner.id,
        assessmentId: otherCompletedAssessmentId,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: 'STARTED_ID',
        organizationLearnerId: organizationLearner.id,
        assessmentId: startedAssessmentId,
      });
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getAllCompletedMissionIds(organizationLearner.id);
      expect(result).to.deep.equal(['COMPLETED_ID', 'OTHER_COMPLETED_ID']);
    });

    it('should return organization learner even without completed missions', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getAllCompletedMissionIds(organizationLearner.id);
      expect(result).to.deep.equal([]);
    });
  });
});
