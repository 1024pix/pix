import _ from 'lodash';
import { expect, knex } from '../../../../test-helper.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { createMissionAssessment } from '../../../../../src/school/domain/usecases/create-mission-assessment.js';

describe('Integration | UseCases | create-mission-assessment', function () {
  let dependencies;
  const testMissionId = 'thematic6789';

  beforeEach(async function () {
    dependencies = {
      assessmentRepository,
    };
  });

  afterEach(async function () {
    await knex('assessments').where({ missionId: testMissionId }).delete();
  });

  it('should save a new mission assessment', async function () {
    // given
    const missionId = testMissionId;
    // when
    await createMissionAssessment({
      missionId,
      ...dependencies,
    });

    const expectedAssessment = {
      missionId: testMissionId,
      state: 'started',
      type: 'PIX1D_MISSION',
      method: 'PIX1D',
    };
    const record = await knex('assessments').where({ missionId }).first();
    // then
    expect(_.pick(record, Object.keys(expectedAssessment))).to.deep.equal(expectedAssessment);
  });
});
