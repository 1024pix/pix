import { MissionAssessment } from '../../../../../src/school/infrastructure/models/mission-assessment.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Repository | mission-assessment-repository', function () {
  describe('#getByAssessmentId', function () {
    it('returns the missionAssessment corresponding to the assessmentId', async function () {
      const missionId = 123;
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
      const missionId = 123;
      const otherMissionId = 456;
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
      const missionId = 123;
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
      const completedMissionId = 123;
      const otherCompletedMissionId = 456;
      const startedMissionId = 789;

      databaseBuilder.factory.buildMissionAssessment({
        missionId: completedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: completedAssessmentId,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: otherCompletedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: otherCompletedAssessmentId,
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: startedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: startedAssessmentId,
      });
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getAllCompletedMissionIds(organizationLearner.id);
      expect(result).to.deep.equal([completedMissionId, otherCompletedMissionId]);
    });

    it('should return organization learner even without completed missions', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getAllCompletedMissionIds(organizationLearner.id);
      expect(result).to.deep.equal([]);
    });
  });

  describe('#getStatusesForLearners', function () {
    it('should return references or last assessment started and completed', async function () {
      const organizationLearnerWithCompletedAssessment = databaseBuilder.factory.buildOrganizationLearner();
      const organizationLearnerWithStartedAssessment = databaseBuilder.factory.buildOrganizationLearner();
      const organizationLearnerWithoutAssessment = databaseBuilder.factory.buildOrganizationLearner();
      const organizationLearnerWhoRetriedMission = databaseBuilder.factory.buildOrganizationLearner();
      const organizationLearnerWhoRetriedAndCompletedMissions = databaseBuilder.factory.buildOrganizationLearner();

      const missionId = 1;

      const startedMissionAssessment = databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithStartedAssessment.id,
        state: Assessment.states.STARTED,
        createdAt: new Date('2023-10-10'),
      });

      const completedMissionAssessment = databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithCompletedAssessment.id,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2024-10-10'),
      });

      const firstMissionAssessmentCompleted = databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWhoRetriedMission.id,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2023-10-10'),
      });

      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWhoRetriedMission.id,
        state: Assessment.states.STARTED,
        createdAt: new Date('2024-10-11'),
      });

      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWhoRetriedAndCompletedMissions.id,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2023-10-10'),
      });

      const secondMissionAssessmentCompleted = databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWhoRetriedAndCompletedMissions.id,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2024-10-11'),
      });

      await databaseBuilder.commit();

      const organizationLearners = [
        organizationLearnerWithCompletedAssessment,
        organizationLearnerWithoutAssessment,
        organizationLearnerWithStartedAssessment,
        organizationLearnerWhoRetriedMission,
        organizationLearnerWhoRetriedAndCompletedMissions,
      ];
      const results = await missionAssessmentRepository.getStatusesForLearners(
        missionId,
        organizationLearners,
        (learner, status, assessmentId) => {
          return [learner.id, status, assessmentId];
        },
      );

      expect(results).to.deep.equal([
        [organizationLearnerWithCompletedAssessment.id, 'completed', completedMissionAssessment.assessmentId],
        [organizationLearnerWithoutAssessment.id, undefined, undefined],
        [organizationLearnerWithStartedAssessment.id, 'started', startedMissionAssessment.assessmentId],
        [organizationLearnerWhoRetriedMission.id, 'completed', firstMissionAssessmentCompleted.assessmentId],
        [
          organizationLearnerWhoRetriedAndCompletedMissions.id,
          'completed',
          secondMissionAssessmentCompleted.assessmentId,
        ],
      ]);
    });

    it('should return empty array when there is no learners', async function () {
      const missionId = 1;
      const results = await missionAssessmentRepository.getStatusesForLearners(
        missionId,
        [],
        (learner, status, assessmentId) => {
          return [learner.id, status, assessmentId];
        },
      );

      expect(results).to.deep.equal([]);
    });
  });
});
