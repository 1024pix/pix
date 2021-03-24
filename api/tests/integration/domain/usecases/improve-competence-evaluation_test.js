const { expect, databaseBuilder, knex } = require('../../../test-helper');
const improveCompetenceEvaluation = require('../../../../lib/domain/usecases/improve-competence-evaluation');

const competenceEvaluationRepository = require('../../../../lib/infrastructure/repositories/competence-evaluation-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const getCompetenceLevel = require('../../../../lib/domain/services/get-competence-level');

describe('Integration | UseCase | Improve Competence Evaluation', function() {
  const competenceId = 'recCompetenceId';
  let competenceEvaluation, userId;

  beforeEach(async function() {
    userId = databaseBuilder.factory.buildUser().id;
    competenceEvaluation = databaseBuilder.factory.buildCompetenceEvaluation({ userId, competenceId });
    await databaseBuilder.commit();
  });

  it('should create an improving assessment', async function() {
    // when
    await improveCompetenceEvaluation({ competenceEvaluationRepository, assessmentRepository, getCompetenceLevel, userId, competenceId });

    // then
    const [updatedCompetenceEvaluation] = await knex('competence-evaluations').where({ id: competenceEvaluation.id });
    const [assessment] = await knex('assessments').where({ id: updatedCompetenceEvaluation.assessmentId });
    expect(assessment.isImproving).to.equal(true);
  });

});
