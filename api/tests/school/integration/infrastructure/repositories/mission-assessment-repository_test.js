import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { MissionLearner } from '../../../../../src/school/domain/models/MissionLearner.js';
import {
  MissionAssessment,
  MissionAssessmentResult,
} from '../../../../../src/school/infrastructure/models/mission-assessment.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Repository | mission-assessment-repository', function () {
  describe('#getByAssessmentId', function () {
    it('returns the missionAssessment corresponding to the assessmentId', async function () {
      const missionId = 123;
      const assessmentId = databaseBuilder.factory.buildPix1dAssessment().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        assessmentId,
        organizationLearnerId,
        status: Assessment.states.COMPLETED,
        result: new MissionAssessmentResult({ global: Assessment.results.REACHED }),
      });
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getByAssessmentId(assessmentId);

      expect(result).to.deep.equal(
        new MissionAssessment({
          missionId,
          assessmentId,
          organizationLearnerId,
          result: new MissionAssessmentResult({ global: Assessment.results.REACHED }),
        }),
      );
    });
  });

  describe('#updateResult', function () {
    it('returns the missionAssessment updating with the result', async function () {
      const missionId = 123;
      const assessmentId = databaseBuilder.factory.buildPix1dAssessment().id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        assessmentId,
        organizationLearnerId,
        status: Assessment.states.COMPLETED,
        result: null,
      });
      await databaseBuilder.commit();

      await missionAssessmentRepository.updateResult(assessmentId, { global: Assessment.results.REACHED });

      const { result } = await knex('mission-assessments').select('result').where({ assessmentId }).first();

      expect(result.global).to.deep.equal(Assessment.results.REACHED);
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

      expect(result).to.deep.equal(
        new MissionAssessment({
          missionId,
          assessmentId,
          organizationLearnerId,
        }),
      );
    });

    it('should not return any assessment', async function () {
      const missionId = 123;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getCurrent(missionId, organizationLearnerId);

      expect(result).to.deep.equal(null);
    });
  });

  describe('#getMissionIdsByState', function () {
    it('should return mission ids for all mission assessment for given organization learner', async function () {
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
        createdAt: new Date('2022-07-07'),
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: otherCompletedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: otherCompletedAssessmentId,
        createdAt: new Date('2024-09-08'),
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: startedMissionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: startedAssessmentId,
      });
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getMissionIdsByState(organizationLearner.id);
      expect(result).to.deep.equal({
        completed: [completedMissionId, otherCompletedMissionId],
        started: [startedMissionId],
      });
    });

    it('should return organization learner even without missions', async function () {
      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getMissionIdsByState(organizationLearner.id);
      expect(result).to.deep.equal({});
    });

    it('should group on last assessment state', async function () {
      const missionId = 789;

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner();
      const completedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2024-06-21'),
      }).id;
      const startedAssessmentId = databaseBuilder.factory.buildPix1dAssessment({
        state: Assessment.states.STARTED,
        createdAt: new Date('2024-07-21'),
      }).id;

      databaseBuilder.factory.buildMissionAssessment({
        missionId: missionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: completedAssessmentId,
        createdAt: new Date('2024-06-21'),
      });
      databaseBuilder.factory.buildMissionAssessment({
        missionId: missionId,
        organizationLearnerId: organizationLearner.id,
        assessmentId: startedAssessmentId,
        createdAt: new Date('2024-07-21'),
      });
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getMissionIdsByState(organizationLearner.id);
      expect(result).to.deep.equal({
        started: [missionId],
      });
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
        result: null,
      });

      const completedMissionAssessment = databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWithCompletedAssessment.id,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2024-10-10'),
        result: {
          global: Assessment.results.REACHED,
          steps: [Assessment.results.REACHED],
          dare: Assessment.results.NOT_REACHED,
        },
      });

      const firstMissionAssessmentCompleted = databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId: organizationLearnerWhoRetriedMission.id,
        state: Assessment.states.COMPLETED,
        createdAt: new Date('2023-10-10'),
        result: {
          global: Assessment.results.NOT_REACHED,
          steps: [Assessment.results.NOT_REACHED],
          dare: Assessment.results.NOT_REACHED,
        },
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
        result: {
          global: Assessment.results.EXCEEDED,
          steps: [Assessment.results.REACHED],
          dare: Assessment.results.REACHED,
        },
      });

      await databaseBuilder.commit();

      const organizationLearners = [
        organizationLearnerWithCompletedAssessment,
        organizationLearnerWithoutAssessment,
        organizationLearnerWithStartedAssessment,
        organizationLearnerWhoRetriedMission,
        organizationLearnerWhoRetriedAndCompletedMissions,
      ];
      const results = await missionAssessmentRepository.getStatusesForLearners(missionId, organizationLearners);

      expect(results).to.deep.equal([
        new MissionLearner({
          ...organizationLearnerWithCompletedAssessment,
          missionStatus: 'completed',
          result: completedMissionAssessment.result,
        }),
        new MissionLearner({ ...organizationLearnerWithoutAssessment, missionStatus: 'not-started' }),
        new MissionLearner({
          ...organizationLearnerWithStartedAssessment,
          missionStatus: 'started',
          result: startedMissionAssessment.result,
        }),
        new MissionLearner({
          ...organizationLearnerWhoRetriedMission,
          missionStatus: 'completed',
          result: firstMissionAssessmentCompleted.result,
        }),
        new MissionLearner({
          ...organizationLearnerWhoRetriedAndCompletedMissions,
          missionStatus: 'completed',
          result: secondMissionAssessmentCompleted.result,
        }),
      ]);
    });

    it('should return empty array when there is no learners', async function () {
      const missionId = 1;
      const results = await missionAssessmentRepository.getStatusesForLearners(missionId, []);

      expect(results).to.deep.equal([]);
    });
  });
});
