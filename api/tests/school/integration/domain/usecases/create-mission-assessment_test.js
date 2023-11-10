import _ from 'lodash';
import { databaseBuilder, expect, knex } from '../../../../test-helper.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { createMissionAssessment } from '../../../../../src/school/domain/usecases/create-mission-assessment.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

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

    const missionAssessment = await createMissionAssessment({
      missionId,
      organizationLearnerId,
      ...dependencies,
    });

    const assessment = {
      state: Assessment.states.STARTED,
      type: Assessment.types.PIX1D_MISSION,
      method: Assessment.methods.PIX1D,
    };
    const record = await knex('assessments').where({ id: missionAssessment.assessmentId }).first();

    expect(_.pick(record, Object.keys(assessment))).to.deep.equal(assessment);
  });

  it('should save a new mission assessment', async function () {
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
    await databaseBuilder.commit();

    const missionAssessment = await createMissionAssessment({
      missionId,
      organizationLearnerId,
      ...dependencies,
    });

    const record = await knex('mission-assessments').where({ assessmentId: missionAssessment.assessmentId }).first();
    expect(_.pick(record, Object.keys(missionAssessment))).to.deep.equal(missionAssessment);
  });
});
