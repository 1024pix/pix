const { expect, sinon, domainBuilder } = require('../../../test-helper');
const improveCompetenceEvaluation = require('../../../../lib/domain/usecases/improve-competence-evaluation');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | UseCase | Improve Competence Evaluation', () => {
  let competenceEvaluation, userId, competenceEvaluationRepository, assessmentRepository;
  let competenceId;
  let expectedAssessment;
  let createdAssessment;
  const domainTransaction = Symbol('DomainTransaction');

  beforeEach(() => {
    competenceEvaluation = domainBuilder.buildCompetenceEvaluation();
    userId = 'validUserId';
    competenceId = 'recCompetence';
    expectedAssessment = new Assessment({
      state: 'started',
      userId,
      competenceId,
      isImproving: true,
      courseId: '[NOT USED] CompetenceId is in Competence Evaluation.',
      type: 'COMPETENCE_EVALUATION'
    });
    const assessmentId = 'created-assessment-id';
    createdAssessment = { ...expectedAssessment, id: assessmentId };

    competenceEvaluationRepository = {
      getByCompetenceIdAndUserId: sinon.stub().resolves(competenceEvaluation),
      save: sinon.stub().resolves({ ...competenceEvaluation, assessmentId })
    };
    assessmentRepository = { save: sinon.stub().resolves(createdAssessment) };
  });

  it('should retrieve competence evaluation from id', async () => {
    // when
    await improveCompetenceEvaluation({ assessmentRepository, competenceEvaluationRepository, userId, competenceId, domainTransaction });

    // then
    expect(competenceEvaluationRepository.getByCompetenceIdAndUserId).to.be.calledWith({ competenceId, userId });
  });

  it('should create an improving assessment', async () => {
    // when
    await improveCompetenceEvaluation({ assessmentRepository, competenceEvaluationRepository, userId, competenceId, domainTransaction });

    // then
    expect(assessmentRepository.save).to.be.calledWith({ assessment: expectedAssessment, domainTransaction });
  });

  it('should update competence evaluation with newly created assessment', async () => {
    // given
    const expectedCompetenceEvaluation = competenceEvaluation;
    expectedCompetenceEvaluation.assessment = createdAssessment;

    // when
    await improveCompetenceEvaluation({ assessmentRepository, competenceEvaluationRepository, userId, competenceId, domainTransaction });

    // then
    expect(competenceEvaluationRepository.save).to.be.calledWith({ competenceEvaluation: expectedCompetenceEvaluation, domainTransaction });
  });

  it('should return competence evaluation with newly created assessment', async () => {
    // given
    const expectedCompetenceEvaluation = competenceEvaluation;
    expectedCompetenceEvaluation.assessmentId = createdAssessment.id;

    // when
    const result = await improveCompetenceEvaluation({ assessmentRepository, competenceEvaluationRepository, userId, competenceId, domainTransaction });

    // then
    expect(result).to.deep.equal(expectedCompetenceEvaluation);
  });

});
