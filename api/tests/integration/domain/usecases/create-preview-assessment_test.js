import { expect, knex } from '../../../test-helper.js';
import { createPreviewAssessment } from '../../../../lib/domain/usecases/create-preview-assessment.js';
import * as assessmentRepository from '../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { Assessment } from '../../../../lib/domain/models/index.js';

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
