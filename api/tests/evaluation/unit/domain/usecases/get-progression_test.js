import sinon from 'sinon';

import { getProgression } from '../../../../../src/evaluation/domain/usecases/get-progression.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Use Cases | get-progression', function () {
  const assessmentId = 1234;
  const progressionId = `progression-${assessmentId}`;
  const userId = 9874;

  let campaignParticipationRepository;
  let campaignRepository;
  let knowledgeElementRepository;
  let assessmentRepository;
  let competenceEvaluationRepository;
  let skillRepository;
  let improvementService;

  beforeEach(function () {
    campaignParticipationRepository = { get: sinon.stub(), isRetrying: sinon.stub() };
    campaignRepository = { findSkillIds: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub().resolves([]) };
    assessmentRepository = { getByAssessmentIdAndUserId: sinon.stub() };
    competenceEvaluationRepository = { getByAssessmentId: sinon.stub() };
    skillRepository = { findActiveByCompetenceId: sinon.stub() };
    improvementService = { filterKnowledgeElements: sinon.stub() };
  });

  describe('#getProgression', function () {
    context('when the assessment exists and is competence evaluation', function () {
      let competenceEvaluationAssessment, competenceEvaluation, competenceSkills;

      beforeEach(function () {
        competenceEvaluationAssessment = domainBuilder.buildAssessment({
          id: assessmentId,
          userId,
          type: Assessment.types.COMPETENCE_EVALUATION,
        });
        competenceEvaluation = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessmentId,
          userId,
        });
        competenceSkills = [domainBuilder.buildSkill()];

        assessmentRepository.getByAssessmentIdAndUserId.resolves(competenceEvaluationAssessment);
        competenceEvaluationRepository.getByAssessmentId.resolves(competenceEvaluation);
        skillRepository.findActiveByCompetenceId.resolves(competenceSkills);
        improvementService.filterKnowledgeElements
          .withArgs({
            knowledgeElements: [],
            createdAt: competenceEvaluationAssessment.createdAt,
            isImproving: competenceEvaluationAssessment.isImproving,
          })
          .returns([]);
      });

      it('should load the right assessment', async function () {
        // when
        await getProgression({
          userId,
          progressionId,
          assessmentRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          skillRepository,
          campaignRepository,
          improvementService,
        });

        // then
        expect(competenceEvaluationRepository.getByAssessmentId).to.have.been.calledWithExactly(assessmentId);
      });

      it('should return the progression associated to the assessment', async function () {
        // given
        const expectedProgression = domainBuilder.buildProgression({
          id: progressionId,
          skillIds: competenceSkills.map((skill) => skill.id),
          knowledgeElements: [],
          isProfileCompleted: competenceEvaluationAssessment.isCompleted(),
        });

        // when
        const progression = await getProgression({
          userId,
          progressionId,
          assessmentRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          skillRepository,
          campaignRepository,
          improvementService,
        });

        // then
        expect(progression).to.deep.equal(expectedProgression);
      });

      context('when the assessment is improving', function () {
        let knowledgeElements, knowledgeElementsFiltered;

        beforeEach(function () {
          competenceEvaluationAssessment.state = 'improving';
          knowledgeElements = [domainBuilder.buildKnowledgeElement(), domainBuilder.buildKnowledgeElement()];
          knowledgeElementsFiltered = [knowledgeElements[0]];
          knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);

          improvementService.filterKnowledgeElements
            .withArgs({
              knowledgeElements,
              createdAt: competenceEvaluationAssessment.createdAt,
              isImproving: competenceEvaluationAssessment.isImproving,
            })
            .returns(knowledgeElementsFiltered);
        });

        it('should filter the knowledge elements', async function () {
          // when
          await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(improvementService.filterKnowledgeElements).to.have.been.calledWithExactly({
            knowledgeElements,
            createdAt: competenceEvaluationAssessment.createdAt,
            isImproving: competenceEvaluationAssessment.isImproving,
          });
        });

        it('should return the progression associated to the assessment', async function () {
          // given
          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            skillIds: competenceSkills.map((skill) => skill.id),
            knowledgeElements: knowledgeElementsFiltered,
            isProfileCompleted: competenceEvaluationAssessment.isCompleted(),
          });

          // when
          const progression = await getProgression({
            userId,
            progressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            campaignRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });
    });

    context('when the assessment does not exist', function () {
      it('should transfer the errors', async function () {
        // given
        assessmentRepository.getByAssessmentIdAndUserId.rejects(new NotFoundError('No found Assessment for ID 1234'));

        // when
        const error = await catchErr(getProgression)({
          userId,
          progressionId,
          assessmentRepository,
          campaignParticipationRepository,
          competenceEvaluationRepository,
          knowledgeElementRepository,
          skillRepository,
          campaignRepository,
          improvementService,
        });

        // then
        return expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
