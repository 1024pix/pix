const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getProgression = require('../../../../lib/domain/usecases/get-progression');

const Assessment = require('../../../../lib/domain/models/Assessment');

const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-progression', () => {

  const progressionId = 'progression-1234';
  const assessmentId = 1234;
  const userId = 9874;

  const smartPlacementAssessmentRepository = { get: () => undefined };
  const knowledgeElementRepository = { findUniqByUserId: () => undefined };
  const assessmentRepository = { getByAssessmentIdAndUserId: () => undefined };
  const competenceEvaluationRepository = { getByAssessmentId: () => undefined };
  const skillRepository = { findByCompetenceId: () => undefined };
  const improvementService = { filterKnowledgeElementsIfImproving: () => undefined };

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(knowledgeElementRepository, 'findUniqByUserId').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#getProgression', () => {

    context('when the assessment exists and is smart placement', () => {

      const assessment = domainBuilder.buildAssessment({
        id: assessmentId,
        userId,
        state: 'completed',
        type: Assessment.types.SMARTPLACEMENT,
      });

      const smartPlacementAssessment = domainBuilder.buildSmartPlacementAssessment({
        id: assessmentId,
        userId,
      });

      beforeEach(() => {
        sandbox.stub(assessmentRepository, 'getByAssessmentIdAndUserId').resolves(assessment);
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
          knowledgeElementRepository,
          skillRepository,
          improvementService
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
          knowledgeElementRepository,
          skillRepository,
          improvementService
        });

        // then
        return promise.then((progression) => {
          expect(progression).to.deep.equal(expectedProgression);
        });
      });

      context('when the assessment is improving', () => {
        let knowledgeElements, knowledgeElementsFiltered;
        beforeEach(() => {
          assessment.state = 'improving';
          knowledgeElements = [
            domainBuilder.buildKnowledgeElement(),
            domainBuilder.buildKnowledgeElement()
          ];
          knowledgeElementsFiltered = [knowledgeElements[0]];
          knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);

          sandbox.stub(improvementService, 'filterKnowledgeElementsIfImproving')
            .withArgs({ knowledgeElements, assessment }).returns(knowledgeElementsFiltered);
        });

        it('should filter the knowledge elements', () => {
          // when
          const promise = getProgression({
            userId,
            progressionId,
            assessmentRepository,
            competenceEvaluationRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            skillRepository,
            improvementService,
          });

          // then
          return promise.then(() => {
            expect(improvementService.filterKnowledgeElementsIfImproving)
              .to.have.been.calledWith({ knowledgeElements, assessment });
          });
        });

        it('should return the progression associated to the assessment', () => {
          // given
          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            targetedSkills: smartPlacementAssessment.targetProfile.skills,
            knowledgeElements: knowledgeElementsFiltered,
            isProfileCompleted: smartPlacementAssessment.isCompleted
          });

          // when
          const promise = getProgression({
            userId,
            progressionId,
            assessmentRepository,
            competenceEvaluationRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            skillRepository,
            improvementService,

          });

          // then
          return promise.then((progression) => {
            expect(progression).to.deep.equal(expectedProgression);
          });
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
        sandbox.stub(assessmentRepository, 'getByAssessmentIdAndUserId').resolves(competenceEvaluationAssessment);
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
          knowledgeElementRepository,
          skillRepository,
          improvementService
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
          knowledgeElementRepository,
          skillRepository,
          improvementService
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
        sandbox.stub(assessmentRepository, 'getByAssessmentIdAndUserId').resolves(assessment);
      });

      it('should transfer the errors', () => {
        // given
        assessmentRepository.getByAssessmentIdAndUserId.rejects(new NotFoundError('No found Assessment for ID 1234'));

        // when
        const promise = getProgression({
          userId,
          progressionId,
          assessmentRepository,
          competenceEvaluationRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          skillRepository,
          improvementService
        });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });
  });
});
