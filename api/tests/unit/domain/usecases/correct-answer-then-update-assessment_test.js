const { expect, sinon, domainBuilder } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

const correctAnswerThenUpdateAssessment = require('../../../../lib/domain/usecases/correct-answer-then-update-assessment');

const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | correct-answer-then-update-assessment', () => {

  const answerRepository = {
    findByChallengeAndAssessment: () => undefined,
    save: () => undefined,
  };
  const assessmentRepository = { get: () => undefined };
  const challengeRepository = { get: () => undefined };
  const competenceEvaluationRepository = { getByAssessmentId: () => undefined };
  const smartPlacementAssessmentRepository = { get: () => undefined };
  const skillRepository = { findByCompetenceId: () => undefined };
  const smartPlacementKnowledgeElementRepository = {
    save: () => undefined,
    findUniqByUserId: () => undefined,
  };

  beforeEach(() => {
    sinon.stub(answerRepository, 'findByChallengeAndAssessment');
    sinon.stub(answerRepository, 'save');
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(challengeRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'getByAssessmentId');
    sinon.stub(skillRepository, 'findByCompetenceId');
    sinon.stub(smartPlacementAssessmentRepository, 'get');
    sinon.stub(smartPlacementKnowledgeElementRepository, 'save');
    sinon.stub(smartPlacementKnowledgeElementRepository, 'findUniqByUserId');
    sinon.stub(SmartPlacementKnowledgeElement, 'createKnowledgeElementsForAnswer');
  });

  context('when an answer for that challenge and that assessment already exists', () => {

    let answer;
    let result;

    beforeEach(() => {
      // given
      answer = domainBuilder.buildAnswer();
      answerRepository.findByChallengeAndAssessment.resolves(true);

      // when
      result = correctAnswerThenUpdateAssessment({
        answer,
        answerRepository,
        challengeRepository,
        smartPlacementAssessmentRepository,
        smartPlacementKnowledgeElementRepository,
      });
    });

    it('should call the answer repository to check if challenge has already been answered', () => {
      // then
      const expectedArguments = {
        assessmentId: answer.assessmentId,
        challengeId: answer.challengeId,
      };
      return result.catch((error) => error)
        .then(() => {
          return expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
        });
    });
    it('should fail because Challenge Already Answered', () => {
      // then
      return expect(result).to.be.rejectedWith(ChallengeAlreadyAnsweredError);
    });
  });

  context('when no answer already exists', () => {

    context('and assessment is a COMPETENCE_EVALUATION', () => {

      let answer;
      let assessment;
      let challenge;
      let competenceEvaluation;
      let knowledgeElement;
      let firstCreatedKnowledgeElement;
      let secondCreatedKnowledgeElement;
      let skills;
      let completedAnswer;
      let correctAnswerValue;
      let savedAnswer;
      let solution;
      let validator;

      beforeEach(() => {
        // given
        correctAnswerValue = '1';

        answer = domainBuilder.buildAnswer({ value: correctAnswerValue });
        answer.id = undefined;
        answer.result = undefined;
        answer.resultDetails = undefined;

        solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
        validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
        challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });
        assessment = domainBuilder.buildAssessment({ type: Assessment.types.COMPETENCE_EVALUATION });
        competenceEvaluation = domainBuilder.buildCompetenceEvaluation();
        knowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement();
        firstCreatedKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement();
        secondCreatedKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement();
        skills = domainBuilder.buildSkillCollection();

        completedAnswer = domainBuilder.buildAnswer(answer);
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        answerRepository.findByChallengeAndAssessment.resolves(false);
        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.save.resolves(savedAnswer);
        competenceEvaluationRepository.getByAssessmentId.resolves(competenceEvaluation);
        skillRepository.findByCompetenceId.resolves(skills);
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([knowledgeElement]);
        SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer.returns([
          firstCreatedKnowledgeElement, secondCreatedKnowledgeElement,
        ]);
        smartPlacementAssessmentRepository.get.rejects(new NotFoundError());
      });

      it('should call the answer repository to check if challenge has already been answered', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArguments = {
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
        };
        expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        expect(answerRepository.save).to.have.been.calledWith(completedAnswer);
      });

      it('should call repositories to get needed information', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        expect(competenceEvaluationRepository.getByAssessmentId).to.have.been.calledWith(assessment.id);
        expect(skillRepository.findByCompetenceId).to.have.been.calledWith(competenceEvaluation.competenceId);
        expect(smartPlacementKnowledgeElementRepository.findUniqByUserId).to.have.been.calledWith(assessment.userId);
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });
    });

    context('and assessment is a SMART_PLACEMENT', () => {

      let answer;
      let assessment;
      let smartPlacementAssessment;
      let challenge;
      let completedAnswer;
      let correctAnswerValue;
      let firstKnowledgeElement;
      let savedAnswer;
      let secondKnowledgeElement;
      let solution;
      let validator;

      beforeEach(() => {
        // given
        correctAnswerValue = '1';

        answer = domainBuilder.buildAnswer();
        answer.id = undefined;
        answer.result = undefined;
        answer.resultDetails = undefined;

        solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
        validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
        challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });

        completedAnswer = domainBuilder.buildAnswer(answer);
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        assessment = domainBuilder.buildAssessment({ type: Assessment.types.SMARTPLACEMENT });
        smartPlacementAssessment = domainBuilder.buildSmartPlacementAssessment();
        firstKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement();
        secondKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement();

        answerRepository.findByChallengeAndAssessment.resolves(false);
        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.save.resolves(savedAnswer);
        smartPlacementAssessmentRepository.get.resolves(smartPlacementAssessment);
        SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer.returns([
          firstKnowledgeElement, secondKnowledgeElement,
        ]);
      });

      it('should call the answer repository to check if challenge has already been answered', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArguments = {
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
        };
        expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = completedAnswer;
        expect(answerRepository.save).to.have.been.calledWith(expectedArgument);
      });

      it('should call the smart placement assessment repository to try and get the assessment', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = answer.assessmentId;
        expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should create the knowledge elements for the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = {
          answer: savedAnswer,
          challenge: challenge,
          previouslyFailedSkills: smartPlacementAssessment.getFailedSkills(),
          previouslyValidatedSkills: smartPlacementAssessment.getValidatedSkills(),
          targetSkills: smartPlacementAssessment.targetProfile.skills,
          userId: smartPlacementAssessment.userId
        };
        expect(SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer).to.have.been.calledWith(expectedArgument);
      });

      it('should save the newly created knowledge elements', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgs = [
          [firstKnowledgeElement],
          [secondKnowledgeElement],
        ];
        expect(smartPlacementKnowledgeElementRepository.save.args).to.deep.equal(expectedArgs);
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });
    });

    context('and assessment is a nor a SMART_PLACEMENT nor a COMPETENCE_EVALUATION', () => {

      let answer;
      let assessment;
      let challenge;
      let completedAnswer;
      let correctAnswerValue;
      let savedAnswer;
      let solution;
      let validator;

      beforeEach(() => {
        // given
        correctAnswerValue = '1';

        answer = domainBuilder.buildAnswer();
        answer.id = undefined;
        answer.result = undefined;
        answer.resultDetails = undefined;

        solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
        validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
        challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });

        completedAnswer = domainBuilder.buildAnswer(answer);
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        assessment = domainBuilder.buildAssessment({ type: Assessment.types.CERTIFICATION });

        answerRepository.findByChallengeAndAssessment.resolves(false);
        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.save.resolves(savedAnswer);
      });

      it('should call the answer repository to check if challenge has already been answered', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArguments = {
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
        };
        expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = completedAnswer;
        expect(answerRepository.save).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          smartPlacementKnowledgeElementRepository,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });
    });
  });
});
