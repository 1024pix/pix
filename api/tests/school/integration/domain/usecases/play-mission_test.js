import _ from 'lodash';

import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { playMission } from '../../../../../src/school/domain/usecases/play-mission.js';
import * as activityRepository from '../../../../../src/school/infrastructure/repositories/activity-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, domainBuilder, expect, knex, mockLearningContent } from '../../../../test-helper.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

describe('Integration | UseCases | play-mission', function () {
  const dependencies = {
    activityRepository,
    assessmentRepository,
    missionAssessmentRepository,
    missionRepository,
  };
  const missionId = 6789;

  context('when no assessment is started for learner and mission', function () {
    it('should save a new assessment for Pix1D', async function () {
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      mockLearningContent({
        missions: [
          learningContentBuilder.buildMission({
            id: missionId,
            content: {
              tutorialChallenges: [['first_di_challenge_id']],
              validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
            },
          }),
        ],
      });

      const result = await playMission({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const assessment = {
        state: Assessment.states.STARTED,
        type: Assessment.types.PIX1D_MISSION,
        method: Assessment.methods.PIX1D,
      };
      const record = await knex('assessments').where({ id: result.id }).first();

      expect(_.pick(record, Object.keys(assessment))).to.deep.equal(assessment);
    });

    it('should save a new mission assessment', async function () {
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      mockLearningContent({
        missions: [
          learningContentBuilder.buildMission({
            id: missionId,
            content: {
              tutorialChallenges: [['first_di_challenge_id']],
              validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
            },
          }),
        ],
      });

      const result = await playMission({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const expectedMissionAssesment = {
        missionId: `${missionId}`,
        organizationLearnerId,
        assessmentId: result.id,
      };
      const missionAssesment = await knex('mission-assessments').where({ assessmentId: result.id }).first();
      expect(_.pick(missionAssesment, Object.keys(expectedMissionAssesment))).to.deep.equal(expectedMissionAssesment);
    });

    it('should save an activity', async function () {
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      mockLearningContent({
        missions: [
          learningContentBuilder.buildMission({
            id: missionId,
            content: {
              tutorialChallenges: [['first_di_challenge_id']],
              validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
            },
          }),
        ],
      });

      const result = await playMission({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const activity = {
        level: Activity.levels.VALIDATION,
        status: Activity.status.STARTED,
        alternativeVersion: 0,
      };
      const record = await knex('activities').where({ assessmentId: result.id }).first();
      expect(_.pick(record, Object.keys(activity))).to.deep.equal(activity);
    });

    it('should return the school assessment', async function () {
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      mockLearningContent({
        missions: [
          learningContentBuilder.buildMission({
            id: missionId,
            content: {
              tutorialChallenges: [['first_di_challenge_id']],
              validationChallenges: [['first_va_challenge_id'], ['second_va_challenge_id']],
            },
          }),
        ],
      });

      const assessment = await playMission({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const expectedAssessment = domainBuilder.buildSchoolAssessment({
        missionId,
        organizationLearnerId,
        id: assessment.id,
        state: Assessment.states.STARTED,
      });

      expect(_.omit(assessment, ['createdAt', 'updatedAt'])).to.deep.equal(
        _.omit(expectedAssessment, ['createdAt', 'updatedAt']),
      );
    });
  });
  context('when an assessment is started for learner and mission', function () {
    let organizationLearnerId;
    let currentAssessment;

    beforeEach(async function () {
      organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      currentAssessment = databaseBuilder.factory.buildPix1dAssessment({ state: Assessment.states.STARTED });
      databaseBuilder.factory.buildMissionAssessment({
        missionId,
        organizationLearnerId,
        assessmentId: currentAssessment.id,
      });
      await databaseBuilder.commit();
    });

    it('should not save a new assessment for Pix1D', async function () {
      await playMission({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const assessmentNb = await knex('assessments').count().first();

      expect(assessmentNb.count).to.equal(1);
    });

    it('should not save a new mission assessment', async function () {
      await playMission({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const missionAssessmentNb = await knex('mission-assessments').count().first();
      expect(missionAssessmentNb.count).to.equal(1);
    });

    it('should return the existing mission assessment', async function () {
      const assessment = await playMission({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const expectedAssessment = domainBuilder.buildSchoolAssessment({
        organizationLearnerId,
        missionId: `${missionId}`,
        state: Assessment.states.STARTED,
        id: currentAssessment.id,
      });
      expect(assessment).to.deep.equal(expectedAssessment);
    });
  });
});
