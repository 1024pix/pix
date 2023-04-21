const { expect, databaseBuilder, knex } = require('../../../test-helper');
const completeAssessmentForPix1d = require('../../../../lib/domain/usecases/complete-assessment-for-pix1d');
const { states, methods, types } = require('../../../../lib/domain/models/Assessment');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');

describe('Integration | Usecase | complete-assessment-for-pix1d', function () {
  it('should save the assessment as completed', async function () {
    const assessment = databaseBuilder.factory.buildAssessment({
      missionId: 'missionPix1d',
      state: states.STARTED,
      type: types.PIX1D_MISSION,
      method: methods.PIX1D,
    });
    await databaseBuilder.commit();

    // when
    await completeAssessmentForPix1d({
      assessmentId: assessment.id,
      assessmentRepository,
    });

    const updatedAssessment = await knex('assessments').where({ id: assessment.id }).first();

    // then
    expect(updatedAssessment.state).to.equal(states.COMPLETED);
  });
});
