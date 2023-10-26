import _ from 'lodash';
import { expect, knex } from '../../../../test-helper.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { createMissionAssessment } from '../../../../../src/school/domain/usecases/create-mission-assessment.js';

describe('Integration | UseCases | create-mission-assessment', function () {
  let dependencies;
  const testMissionId = 'thematic6789';

  beforeEach(async function () {
    dependencies = {
      assessmentRepository,
      missionAssessmentRepository,
    };
  });

  afterEach(async function () {
    await knex('mission-assessments').where({ missionId: testMissionId }).delete();
    await knex('assessments').where({ missionId: testMissionId }).delete();
  });

  it('should save a new assessment', async function () {
    const missionId = testMissionId;
    const expectedAssessment = {
      missionId: testMissionId,
      state: 'started',
      type: 'PIX1D_MISSION',
      method: 'PIX1D',
    };

    await createMissionAssessment({
      missionId,
      ...dependencies,
    });

    const record = await knex('assessments').where({ missionId }).first();

    expect(_.pick(record, Object.keys(expectedAssessment))).to.deep.equal(expectedAssessment);
  });

  it('should save a new mission assessment', async function () {
    const missionId = testMissionId;

    const createdAssessment = await createMissionAssessment({
      missionId,
      ...dependencies,
    });

    const expectedMissionAssessment = {
      missionId: testMissionId,
      assessmentId: createdAssessment.id,
    };

    const record = await knex('mission-assessments').where({ missionId, assessmentId: createdAssessment.id }).first();
    expect(_.pick(record, Object.keys(expectedMissionAssessment))).to.deep.equal(expectedMissionAssessment);
  });
});
