import _ from 'lodash';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { createMissionAssessment } from '../../../../../src/school/domain/usecases/create-mission-assessment.js';
import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';

describe('Integration | UseCases | create-mission-assessment', function () {
  let dependencies;
  const missionId = 'thematic6789';

  beforeEach(async function () {
    dependencies = {
      assessmentRepository,
      missionAssessmentRepository,
    };
  });

  it('should save a new assessment for Pix1D', async function () {
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
    await databaseBuilder.commit();

    const result = await createMissionAssessment({
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

    const result = await createMissionAssessment({
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

  it('should return a school assessment', async function () {
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
    await databaseBuilder.commit();

    const assessment = await createMissionAssessment({
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
