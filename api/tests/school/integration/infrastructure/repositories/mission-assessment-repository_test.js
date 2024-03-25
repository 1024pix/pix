import { MissionAssessment } from '../../../../../src/school/infrastructure/models/mission-assessment.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

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

  describe('#getCurrent', function () {
    it('should return a started assessment for learner and missionId', async function () {
      const missionId = 'flute79';
      const otherMissionId = 'flute80';
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      const otherOrganizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;

      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        otherOrganizationLearnerId,
        state: Assessment.states.STARTED,
      });

      databaseBuilder.factory.buildMissionAssessment({
        missionId: otherMissionId,
        organizationLearnerId,
        state: Assessment.states.STARTED,
      });

      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId,
        state: Assessment.states.COMPLETED,
      });

      const assessmentId = databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId,
        state: Assessment.states.STARTED,
      }).assessmentId;

      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getCurrent(missionId, organizationLearnerId);

      expect(result).to.deep.equal(new MissionAssessment({ missionId, assessmentId, organizationLearnerId }));
    });

    it('should not return any assessment', async function () {
      const missionId = 'flute79';
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getCurrent(missionId, organizationLearnerId);

      expect(result).to.deep.equal(null);
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
