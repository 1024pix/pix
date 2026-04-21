import { createPreviewAssessment } from '../../../../../src/school/domain/usecases/create-preview-assessment.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { knex } from '../../../../tooling/databases.js';

describe('Integration | UseCases | create-preview-assessment', function () {
  let assessmentId;

  it('should create a preview assessment', async function () {
    // when
    const assessment = await createPreviewAssessment({ assessmentRepository });

    // then
    assessmentId = assessment.id;
    const savedAssessment = await knex('assessments').where({ id: assessmentId }).first();
    expect(savedAssessment.type).to.equal(Assessment.types.PREVIEW);
  });
});
