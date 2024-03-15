import _ from 'lodash';

import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { getOrCreateAssessment } from '../../../../../src/school/domain/usecases/get-or-create-assessment.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | UseCases | get-or-create-assessment', function () {
  const dependencies = {
    assessmentRepository,
    missionAssessmentRepository,
  };
  const missionId = 'thematic6789';

  context('when no assessment is started for learner and mission', function () {
    it('should save a new assessment for Pix1D', async function () {
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const result = await getOrCreateAssessment({
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

      const result = await getOrCreateAssessment({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const expectedMissionAssesment = {
        missionId,
        organizationLearnerId,
        assessmentId: result.id,
      };
      const missionAssesment = await knex('mission-assessments').where({ assessmentId: result.id }).first();
      expect(_.pick(missionAssesment, Object.keys(expectedMissionAssesment))).to.deep.equal(expectedMissionAssesment);
    });

    it('should return a mission assessment', async function () {
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      await databaseBuilder.commit();

      const assessment = await getOrCreateAssessment({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const expectedAssessment = new Assessment({
        missionId,
        organizationLearnerId,
        id: assessment.id,
        state: Assessment.states.STARTED,
      });

      expect(assessment).to.deep.equal(expectedAssessment);
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
      await getOrCreateAssessment({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const assessmentNb = await knex('assessments').count().first();

      expect(assessmentNb.count).to.equal(1);
    });

    it('should not save a new mission assessment', async function () {
      await getOrCreateAssessment({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const missionAssessmentNb = await knex('mission-assessments').count().first();
      expect(missionAssessmentNb.count).to.equal(1);
    });

    it('should return the existing mission assessment', async function () {
      const assessment = await getOrCreateAssessment({
        missionId,
        organizationLearnerId,
        ...dependencies,
      });

      const expectedAssessment = new Assessment({
        organizationLearnerId,
        missionId,
        state: Assessment.states.STARTED,
        id: currentAssessment.id,
      });
      expect(assessment).to.deep.equal(expectedAssessment);
    });
  });
});
