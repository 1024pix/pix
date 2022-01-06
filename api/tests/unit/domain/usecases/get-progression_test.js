const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getProgression = require('../../../../lib/domain/usecases/get-progression');

const Assessment = require('../../../../lib/domain/models/Assessment');

const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | get-progression', function () {
  const assessmentId = 1234;
  const progressionId = `progression-${assessmentId}`;
  const userId = 9874;

  const campaignParticipationRepository = { get: () => undefined, isRetrying: () => undefined };
  const targetProfileRepository = { getByCampaignId: () => undefined };
  const knowledgeElementRepository = { findUniqByUserId: () => undefined };
  const assessmentRepository = { getByAssessmentIdAndUserId: () => undefined };
  const competenceEvaluationRepository = { getByAssessmentId: () => undefined };
  const skillRepository = { findActiveByCompetenceId: () => undefined };
  const improvementService = { filterKnowledgeElementsIfImproving: () => undefined };

  let sandbox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(knowledgeElementRepository, 'findUniqByUserId').resolves([]);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#getProgression', function () {
    let assessment, campaignParticipation, targetProfile, flashAssessment;

    context('when the assessment exists and is campaign', function () {
      beforeEach(function () {
        assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          userId,
          state: 'completed',
          type: Assessment.types.CAMPAIGN,
          campaignParticipationId: 456,
        });
        campaignParticipation = domainBuilder.buildCampaignParticipation({
          campaignId: 123,
        });
        targetProfile = domainBuilder.buildTargetProfile();
        flashAssessment = domainBuilder.buildAssessment.ofTypeCampaign({
          userId,
          targetProfile: null,
          method: 'FLASH',
        });

        sandbox
          .stub(assessmentRepository, 'getByAssessmentIdAndUserId')
          .withArgs(assessment.id, userId)
          .resolves(assessment)
          .withArgs(flashAssessment.id, userId)
          .resolves(flashAssessment);
        sandbox
          .stub(campaignParticipationRepository, 'get')
          .withArgs(assessment.campaignParticipationId)
          .resolves(campaignParticipation)
          .withArgs(flashAssessment.campaignParticipationId)
          .resolves(flashAssessment.campaignParticipation);
        sandbox
          .stub(targetProfileRepository, 'getByCampaignId')
          .withArgs(campaignParticipation.campaignId)
          .resolves(targetProfile);
        sandbox.stub(campaignParticipationRepository, 'isRetrying');
        sandbox.stub(improvementService, 'filterKnowledgeElementsIfImproving');
      });

      it('should return the progression associated to the assessment', async function () {
        // given
        const expectedProgression = domainBuilder.buildProgression({
          id: progressionId,
          targetedSkills: targetProfile.skills,
          knowledgeElements: [],
          isProfileCompleted: assessment.isCompleted(),
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
          targetProfileRepository,
          improvementService,
        });

        // then
        expect(progression).to.deep.equal(expectedProgression);
      });

      context('when the assessment is improving', function () {
        let knowledgeElements, knowledgeElementsFiltered;
        beforeEach(function () {
          assessment.state = 'improving';
          knowledgeElements = [domainBuilder.buildKnowledgeElement(), domainBuilder.buildKnowledgeElement()];
          knowledgeElementsFiltered = [knowledgeElements[0]];
          knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);
          campaignParticipationRepository.isRetrying
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId })
            .resolves(false);
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
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWith({
            knowledgeElements,
            assessment,
            isRetrying: false,
          });
        });

        it('should return the progression associated to the assessment', async function () {
          // given
          improvementService.filterKnowledgeElementsIfImproving
            .withArgs({ knowledgeElements, assessment, isRetrying: false })
            .returns(knowledgeElementsFiltered);
          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            targetedSkills: targetProfile.skills,
            knowledgeElements: knowledgeElementsFiltered,
            isProfileCompleted: assessment.isCompleted(),
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
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });

      context('when the assessment is improving because user is retrying campaign participation', function () {
        let knowledgeElements, knowledgeElementsFiltered;
        beforeEach(function () {
          assessment.state = 'improving';
          knowledgeElements = [domainBuilder.buildKnowledgeElement(), domainBuilder.buildKnowledgeElement()];
          knowledgeElementsFiltered = [knowledgeElements[0]];
          knowledgeElementRepository.findUniqByUserId.resolves(knowledgeElements);
          campaignParticipationRepository.isRetrying
            .withArgs({ campaignParticipationId: assessment.campaignParticipationId })
            .resolves(true);
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
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWith({
            knowledgeElements,
            assessment,
            isRetrying: true,
          });
        });

        it('should return the progression associated to the assessment', async function () {
          // given
          improvementService.filterKnowledgeElementsIfImproving
            .withArgs({ knowledgeElements, assessment, isRetrying: true })
            .returns(knowledgeElementsFiltered);

          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            targetedSkills: targetProfile.skills,
            knowledgeElements: knowledgeElementsFiltered,
            isProfileCompleted: assessment.isCompleted(),
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
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });

      context("campaign's method is flash", function () {
        it('should return the progression associated to the flash assessment', async function () {
          // given
          const flashProgressionId = `progression-${flashAssessment.id}`;
          const expectedProgression = domainBuilder.buildProgression({
            id: flashProgressionId,
            targetedSkills: [],
            knowledgeElements: [],
            isProfileCompleted: assessment.isCompleted(),
          });

          // when
          const progression = await getProgression({
            userId,
            progressionId: flashProgressionId,
            assessmentRepository,
            campaignParticipationRepository,
            competenceEvaluationRepository,
            knowledgeElementRepository,
            skillRepository,
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });
    });

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

        sandbox.stub(assessmentRepository, 'getByAssessmentIdAndUserId').resolves(competenceEvaluationAssessment);
        sandbox.stub(competenceEvaluationRepository, 'getByAssessmentId').resolves(competenceEvaluation);
        sandbox.stub(skillRepository, 'findActiveByCompetenceId').resolves(competenceSkills);
        sandbox
          .stub(improvementService, 'filterKnowledgeElementsIfImproving')
          .withArgs({ knowledgeElements: [], assessment: competenceEvaluationAssessment })
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
          targetProfileRepository,
          improvementService,
        });

        // then
        expect(competenceEvaluationRepository.getByAssessmentId).to.have.been.calledWith(assessmentId);
      });

      it('should return the progression associated to the assessment', async function () {
        // given
        const expectedProgression = domainBuilder.buildProgression({
          id: progressionId,
          targetedSkills: competenceSkills,
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
          targetProfileRepository,
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

          improvementService.filterKnowledgeElementsIfImproving
            .withArgs({ knowledgeElements, assessment: competenceEvaluationAssessment })
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
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(improvementService.filterKnowledgeElementsIfImproving).to.have.been.calledWith({
            knowledgeElements,
            assessment: competenceEvaluationAssessment,
          });
        });

        it('should return the progression associated to the assessment', async function () {
          // given
          const expectedProgression = domainBuilder.buildProgression({
            id: progressionId,
            targetedSkills: competenceSkills,
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
            targetProfileRepository,
            improvementService,
          });

          // then
          expect(progression).to.deep.equal(expectedProgression);
        });
      });
    });

    context('when the assessment does not exist', function () {
      let assessment;

      beforeEach(function () {
        assessment = domainBuilder.buildAssessment({
          id: assessmentId,
          userId,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          type: Assessment.types.CAMPAIGN,
        });

        sandbox.stub(assessmentRepository, 'getByAssessmentIdAndUserId').resolves(assessment);
      });

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
          targetProfileRepository,
          improvementService,
        });

        // then
        return expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
