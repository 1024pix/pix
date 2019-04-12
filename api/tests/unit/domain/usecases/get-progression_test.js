const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getProgression = require('../../../../lib/domain/usecases/get-progression');

const Assessment = require('../../../../lib/domain/models/Assessment');

const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-progression', () => {

  const progressionId = 'progression-1234';
  const assessmentId = 1234;
  const userId = 9874;

  const smartPlacementAssessmentRepository = { get: () => undefined };
  const smartPlacementKnowledgeElementRepository = { findUniqByUserId: () => undefined };
  const assessmentRepository = { getByUserIdAndAssessmentId: () => undefined };
  const competenceEvaluationRepository = { getByAssessmentId: () => undefined };
  const skillRepository = { findByCompetenceId: () => undefined };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(smartPlacementKnowledgeElementRepository, 'findUniqByUserId').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getProgression', () => {

    context('when the assessment exists and is smart placement', () => {

      const assessment = domainBuilder.buildAssessment({
        id: assessmentId,
        userId,
        type: Assessment.types.SMARTPLACEMENT,
      });

      const smartPlacementAssessment = domainBuilder.buildSmartPlacementAssessment({
        id: assessmentId,
        userId,
      });

      beforeEach(() => {
        sandbox.stub(assessmentRepository, 'getByUserIdAndAssessmentId').resolves(assessment);
        sandbox.stub(smartPlacementAssessmentRepository, 'get').resolves(smartPlacementAssessment);
      });

      it('should load the right assessment', () => {
        // when
        const promise = getProgression({
          userId,
          progressionId,
          assessmentRepository,
          competenceEvaluationRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
          skillRepository
        });

        // then
        return promise.then(() => {
          expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(assessmentId);
        });
      });

      it('should return the progression associated to the assessment', () => {
        // given
        const expectedProgression = domainBuilder.buildProgression({
          id: progressionId,
          targetedSkills: smartPlacementAssessment.targetProfile.skills,
          knowledgeElements: [],
          isProfileCompleted: smartPlacementAssessment.isCompleted
        });

        // when
        const promise = getProgression({
          userId,
          progressionId,
          assessmentRepository,
          competenceEvaluationRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
          skillRepository
        });

        // then
        return promise.then((progression) => {
          expect(progression).to.deep.equal(expectedProgression);
        });
      });
    });

    context('when the assessment exists and is competence evaluation', () => {

      const competenceEvaluationAssessment = domainBuilder.buildAssessment({
        id: assessmentId,
        userId,
        type: Assessment.types.COMPETENCE_EVALUATION
      });

      const competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
        competenceId: 1,
        assessmentId,
        userId,
      });

      beforeEach(() => {
        sandbox.stub(assessmentRepository, 'getByUserIdAndAssessmentId').resolves(competenceEvaluationAssessment);
        sandbox.stub(competenceEvaluationRepository, 'getByAssessmentId').resolves(competenceEvaluation);
        sandbox.stub(skillRepository, 'findByCompetenceId').resolves([]);
      });

      it('should load the right assessment', () => {
        // when
        const promise = getProgression({
          userId,
          progressionId,
          assessmentRepository,
          competenceEvaluationRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
          skillRepository
        });

        // then
        return promise.then(() => {
          expect(competenceEvaluationRepository.getByAssessmentId).to.have.been.calledWith(assessmentId);
        });
      });

      it('should return the progression associated to the assessment', () => {
        // given
        const expectedProgression = domainBuilder.buildProgression({
          id: progressionId,
          targetedSkills: [],
          knowledgeElements: [],
          isProfileCompleted: competenceEvaluationAssessment.isCompleted()
        });

        // when
        const promise = getProgression({
          userId,
          progressionId,
          assessmentRepository,
          competenceEvaluationRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
          skillRepository
        });

        // then
        return promise.then((progression) => {
          expect(progression).to.deep.equal(expectedProgression);
        });
      });
    });

    context('when the assessment does not exist', () => {

      const assessment = domainBuilder.buildAssessment({
        id: assessmentId,
        userId,
        type: Assessment.types.SMARTPLACEMENT,
      });

      beforeEach(() => {
        sandbox.stub(assessmentRepository, 'getByUserIdAndAssessmentId').resolves(assessment);
      });

      it('should transfer the errors', () => {
        // given
        assessmentRepository.getByUserIdAndAssessmentId.rejects(new NotFoundError('No found Assessment for ID 1234'));

        // when
        const promise = getProgression({
          userId,
          progressionId,
          assessmentRepository,
          competenceEvaluationRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
          skillRepository
        });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });
  });
});
