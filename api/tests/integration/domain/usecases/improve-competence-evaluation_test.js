import { getCompetenceLevel } from '../../../../src/evaluation/domain/services/get-competence-level.js';
import { improveCompetenceEvaluation } from '../../../../src/evaluation/domain/usecases/improve-competence-evaluation.js';
import * as competenceEvaluationRepository from '../../../../src/evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as assessmentRepository from '../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | UseCase | Improve Competence Evaluation', function () {
  const competenceId = 'recCompetenceId';
  let competenceEvaluation, userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    competenceEvaluation = databaseBuilder.factory.buildCompetenceEvaluation({ userId, competenceId });
    await databaseBuilder.commit();
  });

  it('should create an improving assessment', async function () {
    // when
    await improveCompetenceEvaluation({
      competenceEvaluationRepository,
      assessmentRepository,
      getCompetenceLevel,
      userId,
      competenceId,
    });

    // then
    const [updatedCompetenceEvaluation] = await knex('competence-evaluations').where({ id: competenceEvaluation.id });
    const [assessment] = await knex('assessments').where({ id: updatedCompetenceEvaluation.assessmentId });
    expect(assessment.isImproving).to.equal(true);
  });
});
