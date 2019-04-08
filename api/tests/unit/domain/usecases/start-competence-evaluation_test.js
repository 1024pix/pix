const { expect, sinon, domainBuilder } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | start-competence-evaluation', () => {

  const userId = 19837482;
  const competenceId = 'recABC123';
  const competenceRepository = { get: () => undefined };
  const competenceEvaluationRepository = { save: () => undefined };
  const assessmentRepository = { save: () => undefined };

  beforeEach(() => {
    sinon.stub(competenceRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'save');
    sinon.stub(assessmentRepository, 'save');

    competenceRepository.get.resolves(domainBuilder.buildCompetence());
  });

  it('should throw an error if the competence does not exists', () => {
    // given
    competenceRepository.get.resolves(null);

    // when
    const promise = usecases.startCompetenceEvaluation({
      competenceId,
      userId,
      competenceEvaluationRepository,
      assessmentRepository,
      competenceRepository
    });

    // then
    return expect(promise).to.be.rejectedWith(NotFoundError);
  });

  it('should create an assessment for competence evaluation', () => {
    // given
    assessmentRepository.save.resolves({});

    // when
    const promise = usecases.startCompetenceEvaluation({
      competenceId,
      userId,
      competenceEvaluationRepository,
      assessmentRepository,
      competenceRepository
    });

    // then
    return promise.then(() => {
      expect(assessmentRepository.save).to.have.been.called;

      const assessmentToSave = assessmentRepository.save.firstCall.args[0];
      expect(assessmentToSave.type).to.equal(Assessment.types.COMPETENCE_EVALUATION);
      expect(assessmentToSave.state).to.equal(Assessment.states.STARTED);
      expect(assessmentToSave.userId).to.equal(userId);
      expect(assessmentToSave.courseId).to.equal(Assessment.courseIdMessage.COMPETENCE_EVALUATION);
    });
  });

  it('should save the competence evaluation with userId and assessmentId', () => {
    // given
    const assessmentId = 987654321;
    assessmentRepository.save.resolves({ id: assessmentId });
    competenceEvaluationRepository.save.resolves({});

    // when
    const promise = usecases.startCompetenceEvaluation({
      competenceId,
      userId,
      competenceEvaluationRepository,
      assessmentRepository,
      competenceRepository
    });

    // then
    return promise.then(() => {
      expect(competenceEvaluationRepository.save).to.have.been.called;

      const competenceEvaluationToSave = competenceEvaluationRepository.save.firstCall.args[0];
      expect(competenceEvaluationToSave.userId).to.equal(userId);
      expect(competenceEvaluationToSave.assessmentId).to.equal(assessmentId);
      expect(competenceEvaluationToSave.competenceId).to.equal(competenceId);
    });
  });

  it('should return the saved competence evaluation', () => {
    // given
    const assessmentId = 987654321;
    const createdCompetenceEvaluation = domainBuilder.buildCompetenceEvaluation();
    assessmentRepository.save.resolves({ id: assessmentId });
    competenceEvaluationRepository.save.resolves(createdCompetenceEvaluation);

    // when
    const promise = usecases.startCompetenceEvaluation({
      competenceId,
      userId,
      competenceEvaluationRepository,
      assessmentRepository,
      competenceRepository
    });

    // then
    return promise.then((competenceId) => {
      expect(competenceId).to.deep.equal(createdCompetenceEvaluation);
    });
  });

});
