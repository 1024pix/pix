const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const correctAnswerThenUpdateAssessment = require('../../../../lib/domain/usecases/correct-answer-then-update-assessment');

const { ChallengeAlreadyAnsweredError, NotFoundError, ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | correct-answer-then-update-assessment', () => {
  const userId = 1;
  let assessment;
  let challenge;
  let solution;
  let validator;
  let correctAnswerValue;
  let answer;

  const answerRepository = {
    findByChallengeAndAssessment: () => undefined,
    saveWithKnowledgeElements: () => undefined,
  };
  const assessmentRepository = { get: () => undefined };
  const challengeRepository = { get: () => undefined };
  const competenceEvaluationRepository = {  };
  const targetProfileRepository = { getByCampaignId: () => undefined };
  const skillRepository = { findByCompetenceId: () => undefined };
  const scorecardService = { computeScorecard: () => undefined };
  const knowledgeElementRepository = {
    findUniqByUserId: () => undefined,
  };

  beforeEach(() => {
    sinon.stub(answerRepository, 'findByChallengeAndAssessment');
    sinon.stub(answerRepository, 'saveWithKnowledgeElements');
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(challengeRepository, 'get');
    sinon.stub(skillRepository, 'findByCompetenceId');
    sinon.stub(targetProfileRepository, 'getByCampaignId');
    sinon.stub(scorecardService, 'computeScorecard');
    sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
    sinon.stub(KnowledgeElement, 'createKnowledgeElementsForAnswer');
    assessment = domainBuilder.buildAssessment({ userId });
    answer = domainBuilder.buildAnswer({ assessmentId: assessment.id, value: correctAnswerValue });
    answer.id = undefined;
    answer.result = undefined;
    answer.resultDetails = undefined;
    correctAnswerValue = '1';
    solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
    validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
    challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });
    challengeRepository.get.resolves(challenge);
  });

  context('when an answer for that challenge and that assessment already exists', () => {

    beforeEach(() => {
      // given
      assessment.type = Assessment.types.CERTIFICATION;
      assessmentRepository.get.resolves(assessment);
      answerRepository.findByChallengeAndAssessment.withArgs({ assessmentId: assessment.id, challengeId: challenge.id }).resolves(true);
    });

    it('should fail because Challenge Already Answered', async () => {
      // when
      const error = await catchErr(correctAnswerThenUpdateAssessment)({
        answer,
        userId,
        answerRepository,
        assessmentRepository,
        challengeRepository,
        targetProfileRepository,
        knowledgeElementRepository,
        scorecardService,
      });

      // then
      return expect(error).to.be.an.instanceOf(ChallengeAlreadyAnsweredError);
    });
  });

  context('when no answer already exists', () => {
    let completedAnswer;
    let savedAnswer;

    beforeEach(() => {
      answerRepository.findByChallengeAndAssessment.withArgs({ assessmentId: assessment.id, challengeId: challenge.id }).resolves(false);
      completedAnswer = domainBuilder.buildAnswer(answer);
      completedAnswer.id = undefined;
      completedAnswer.result = AnswerStatus.OK;
      completedAnswer.resultDetails = null;
      savedAnswer = domainBuilder.buildAnswer(completedAnswer);
      answerRepository.saveWithKnowledgeElements.resolves(savedAnswer);
    });

    context('and assessment is a COMPETENCE_EVALUATION', () => {

      let knowledgeElement;
      let firstCreatedKnowledgeElement;
      let secondCreatedKnowledgeElement;
      let skills;
      let scorecard;

      beforeEach(() => {
        // given
        assessment.type = Assessment.types.COMPETENCE_EVALUATION;
        assessment.competenceId = 'recABCD';
        assessmentRepository.get.resolves(assessment);
        knowledgeElement = domainBuilder.buildKnowledgeElement();
        firstCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2 });
        secondCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1 });
        skills = domainBuilder.buildSkillCollection();

        scorecard = domainBuilder.buildUserScorecard({ level: 2, earnedPix: 22, exactlyEarnedPix: 22 });
        skillRepository.findByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([knowledgeElement]);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([
          firstCreatedKnowledgeElement, secondCreatedKnowledgeElement,
        ]);
        targetProfileRepository.getByCampaignId.rejects(new NotFoundError());
        scorecardService.computeScorecard.resolves(scorecard);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        expect(answerRepository.saveWithKnowledgeElements).to.have.been.calledWith(completedAnswer);
      });

      it('should call repositories to get needed information', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        expect(skillRepository.findByCompetenceId).to.have.been.calledWith(assessment.competenceId);
        expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWith({ userId: assessment.userId });
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      context('when the user responds correctly', async () => {
        it('should add the level up to the answer when the user gain one level', async () => {
          // given
          const expectedLevel = scorecard.level + 1;
          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            targetProfileRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({
            id: result.id,
            competenceName: scorecard.name,
            level: expectedLevel,
          });
        });

        it('should return an empty levelup when not gaining a level', async () => {
          KnowledgeElement.createKnowledgeElementsForAnswer.returns([
            domainBuilder.buildKnowledgeElement({ earnedPix: 0 }),
            domainBuilder.buildKnowledgeElement({ earnedPix: 0 }),
          ]);

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            targetProfileRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', async () => {
        it('should not compute the level up', async () => {
          // given
          answer = domainBuilder.buildAnswer({ value: '' });
          answer.id = undefined;
          answer.result = undefined;
          answer.resultDetails = undefined;

          // when
          await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            targetProfileRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(scorecardService.computeScorecard).to.not.have.been.called;
        });
      });
    });

    context('and assessment is a SMART_PLACEMENT', () => {
      let firstKnowledgeElement;
      let secondKnowledgeElement;
      let scorecard, knowledgeElement, targetProfile, skills, challenge, skillAlreadyValidated, skillNotAlreadyValidated;

      beforeEach(() => {
        // given
        assessment.type = Assessment.types.SMARTPLACEMENT;
        assessment.campaignParticipation = domainBuilder.buildCampaignParticipation();
        assessmentRepository.get.resolves(assessment);
        skills = domainBuilder.buildSkillCollection({ minLevel: 1, maxLevel: 4 });
        skillAlreadyValidated = skills[0];
        skillNotAlreadyValidated = skills[2];
        challenge = domainBuilder.buildChallenge({ skills: [skillNotAlreadyValidated], id: answer.challengeId, validator });

        knowledgeElement = domainBuilder.buildKnowledgeElement({ status: 'validated', skillId: skillAlreadyValidated.id });
        firstKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2 });
        secondKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1.8 });
        scorecard = domainBuilder.buildUserScorecard({ level: 2, earnedPix: 20, exactlyEarnedPix: 20.2 });
        targetProfile = domainBuilder.buildTargetProfile({ skills });
        challengeRepository.get.resolves(challenge);

        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([knowledgeElement]);

        targetProfileRepository.getByCampaignId.resolves(targetProfile);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([
          firstKnowledgeElement, secondKnowledgeElement,
        ]);
        scorecardService.computeScorecard.resolves(scorecard);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });
        // then
        const expectedArgs = [
          [completedAnswer,[firstKnowledgeElement, secondKnowledgeElement]],
        ];
        expect(answerRepository.saveWithKnowledgeElements.args).to.deep.equal(expectedArgs);
      });

      it('should call the target profile repository to find target skills', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = assessment.campaignParticipation.campaignId;
        expect(targetProfileRepository.getByCampaignId).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should create the knowledge elements for the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const answerCreated = domainBuilder.buildAnswer(savedAnswer);
        answerCreated.id = undefined;
        const expectedArgument = {
          answer: answerCreated,
          challenge: challenge,
          previouslyFailedSkills: [],
          previouslyValidatedSkills: [skillAlreadyValidated],
          targetSkills: targetProfile.skills,
          userId: assessment.userId
        };
        expect(KnowledgeElement.createKnowledgeElementsForAnswer).to.have.been.calledWith(expectedArgument);
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      context('when the user responds correctly', async () => {
        it('should add the level up to the answer when the user gain one level', async () => {
          // given
          const expectedLevel = scorecard.level + 1;

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            targetProfileRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({
            id: result.id,
            competenceName: scorecard.name,
            level: expectedLevel,
          });
        });

        it('should return an empty levelup when not gaining a level', async () => {
          // given
          KnowledgeElement.createKnowledgeElementsForAnswer.returns([
            domainBuilder.buildKnowledgeElement({ earnedPix: 0 }),
            domainBuilder.buildKnowledgeElement({ earnedPix: 0 }),
          ]);

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            targetProfileRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', async () => {
        it('should not compute the level up', async () => {
          // given
          answer = domainBuilder.buildAnswer({ value: '' });
          answer.id = undefined;
          answer.result = undefined;
          answer.resultDetails = undefined;

          // when
          await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            targetProfileRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(scorecardService.computeScorecard).to.not.have.been.called;
        });
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

        assessment = domainBuilder.buildAssessment({ userId, type: Assessment.types.CERTIFICATION });

        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.saveWithKnowledgeElements.resolves(savedAnswer);
      });

      it('should call the answer repository to check if challenge has already been answered', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
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
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = completedAnswer;
        expect(answerRepository.saveWithKnowledgeElements).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should not call the compute scorecard method', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        expect(scorecardService.computeScorecard).to.not.have.been.called;
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          targetProfileRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });
    });
  });

  context('when the user which want to save the answer is not the right user', () => {

    let answer;
    let assessment;

    beforeEach(() => {
      answer = domainBuilder.buildAnswer();
      assessment = domainBuilder.buildAssessment({ userId: (userId + 1) });
      assessmentRepository.get.resolves(assessment);
    });

    it('should throw an error if no userId is passed', () => {
      // when
      const result = correctAnswerThenUpdateAssessment({
        answer,
        userId,
        answerRepository,
        assessmentRepository,
        scorecardService,
      });

      // then
      return expect(result).to.be.rejectedWith(ForbiddenAccess);
    });
  });

});
