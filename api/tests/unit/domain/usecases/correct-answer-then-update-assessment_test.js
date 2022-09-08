const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const correctAnswerThenUpdateAssessment = require('../../../../lib/domain/usecases/correct-answer-then-update-assessment');

const {
  ChallengeNotAskedError,
  NotFoundError,
  ForbiddenAccess,
  CertificationEndedBySupervisorError,
  CertificationEndedByFinalizationError,
} = require('../../../../lib/domain/errors');
const dateUtils = require('../../../../lib/infrastructure/utils/date-utils');

describe('Unit | Domain | Use Cases | correct-answer-then-update-assessment', function () {
  const userId = 1;
  let assessment;
  let challenge;
  let solution;
  let validator;
  let correctAnswerValue;
  let answer;
  const addOneLevel = {
    level: 1,
    pix: 8,
  };
  const answerRepository = {
    saveWithKnowledgeElements: () => undefined,
  };
  const assessmentRepository = { get: () => undefined };
  const challengeRepository = { get: () => undefined };
  const competenceEvaluationRepository = {};
  const targetProfileRepository = { getByCampaignParticipationId: () => undefined };
  const skillRepository = { findActiveByCompetenceId: () => undefined };
  const flashAssessmentResultRepository = { save: () => undefined };
  const scorecardService = { computeScorecard: () => undefined };
  const knowledgeElementRepository = {
    findUniqByUserIdAndAssessmentId: () => undefined,
  };
  const flashAlgorithmService = { getEstimatedLevelAndErrorRate: () => undefined };
  const algorithmDataFetcherService = { fetchForFlashLevelEstimation: () => undefined };
  const nowDate = new Date('2021-03-11T11:00:04Z');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  nowDate.setMilliseconds(1);

  let dependencies;

  beforeEach(function () {
    sinon.stub(answerRepository, 'saveWithKnowledgeElements');
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(challengeRepository, 'get');
    sinon.stub(skillRepository, 'findActiveByCompetenceId');
    sinon.stub(targetProfileRepository, 'getByCampaignParticipationId');
    sinon.stub(flashAssessmentResultRepository, 'save');
    sinon.stub(scorecardService, 'computeScorecard');
    sinon.stub(knowledgeElementRepository, 'findUniqByUserIdAndAssessmentId');
    sinon.stub(KnowledgeElement, 'createKnowledgeElementsForAnswer');
    sinon.stub(dateUtils, 'getNowDate');
    sinon.stub(flashAlgorithmService, 'getEstimatedLevelAndErrorRate');
    sinon.stub(algorithmDataFetcherService, 'fetchForFlashLevelEstimation');

    const challengeId = 'oneChallengeId';
    assessment = domainBuilder.buildAssessment({ userId, lastQuestionDate: nowDate });
    answer = domainBuilder.buildAnswer({ assessmentId: assessment.id, value: correctAnswerValue, challengeId });
    answer.id = undefined;
    answer.result = undefined;
    answer.resultDetails = undefined;
    correctAnswerValue = '1';
    solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
    validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
    challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });
    challengeRepository.get.resolves(challenge);

    dateUtils.getNowDate.returns(nowDate);

    dependencies = {
      answerRepository,
      assessmentRepository,
      challengeRepository,
      competenceEvaluationRepository,
      skillRepository,
      targetProfileRepository,
      knowledgeElementRepository,
      flashAssessmentResultRepository,
      scorecardService,
      flashAlgorithmService,
      algorithmDataFetcherService,
    };
  });

  context('when an answer for that challenge is not for an asked challenge', function () {
    beforeEach(function () {
      // given
      assessment.type = Assessment.types.CERTIFICATION;
      assessment.lastChallengeId = 'anotherChallenge';
      assessmentRepository.get.resolves(assessment);
    });

    it('should fail because Challenge Not Asked', async function () {
      // when
      const error = await catchErr(correctAnswerThenUpdateAssessment)({
        answer,
        userId,
        ...dependencies,
      });

      // then
      return expect(error).to.be.an.instanceOf(ChallengeNotAskedError);
    });
  });

  context('when the assessment has been ended by supervisor', function () {
    it('should throw a CertificationEndedBySupervisorError error', async function () {
      // given
      assessment.state = Assessment.states.ENDED_BY_SUPERVISOR;
      assessmentRepository.get.resolves(assessment);

      // when
      const error = await catchErr(correctAnswerThenUpdateAssessment)({
        answer,
        userId,
        ...dependencies,
      });

      // then
      return expect(error).to.be.an.instanceOf(CertificationEndedBySupervisorError);
    });
  });

  context('when the assessment has been ended because session was finalized', function () {
    it('should throw a CertificationEndedByFinalizationError error', async function () {
      // given
      const assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: nowDate,
        state: Assessment.states.ENDED_DUE_TO_FINALIZATION,
      });
      assessmentRepository.get.resolves(assessment);

      // when
      const error = await catchErr(correctAnswerThenUpdateAssessment)({
        answer,
        userId,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(CertificationEndedByFinalizationError);
      expect(error.message).to.equal('La session a été finalisée par votre centre de certification.');
    });
  });

  context('when no answer already exists', function () {
    let completedAnswer;
    let savedAnswer;

    beforeEach(function () {
      completedAnswer = domainBuilder.buildAnswer(answer);
      completedAnswer.id = undefined;
      completedAnswer.result = AnswerStatus.OK;
      completedAnswer.resultDetails = null;
      completedAnswer.timeSpent = 0;
      savedAnswer = domainBuilder.buildAnswer(completedAnswer);
      answerRepository.saveWithKnowledgeElements.resolves(savedAnswer);
    });

    context('and assessment is a COMPETENCE_EVALUATION', function () {
      let knowledgeElement;
      let firstCreatedKnowledgeElement;
      let secondCreatedKnowledgeElement;
      let skills;
      let scorecard;

      beforeEach(function () {
        // given
        assessment.type = Assessment.types.COMPETENCE_EVALUATION;
        assessment.competenceId = 'recABCD';
        assessmentRepository.get.resolves(assessment);
        knowledgeElement = domainBuilder.buildKnowledgeElement();
        firstCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2 });
        secondCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1 });
        skills = domainBuilder.buildSkillCollection();

        scorecard = domainBuilder.buildUserScorecard({ level: 2, earnedPix: 22, exactlyEarnedPix: 22 });
        skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
        knowledgeElementRepository.findUniqByUserIdAndAssessmentId
          .withArgs({ userId: assessment.userId, assessmentId: assessment.id })
          .resolves([knowledgeElement]);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([
          firstCreatedKnowledgeElement,
          secondCreatedKnowledgeElement,
        ]);
        targetProfileRepository.getByCampaignParticipationId.rejects(new NotFoundError());
        scorecardService.computeScorecard.resolves(scorecard);
      });

      it('should call the answer repository to save the answer', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        expect(answerRepository.saveWithKnowledgeElements).to.have.been.calledWith(completedAnswer);
      });

      it('should call repositories to get needed information', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        expect(skillRepository.findActiveByCompetenceId).to.have.been.calledWith(assessment.competenceId);
        expect(knowledgeElementRepository.findUniqByUserIdAndAssessmentId).to.have.been.calledWith({
          userId: assessment.userId,
          assessmentId: assessment.id,
        });
      });

      it('should return the saved answer - with the id', async function () {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      context('when the user responds correctly', function () {
        it('should add the level up to the answer when the user gain one level', async function () {
          // given
          const scorecardAfterAnswer = domainBuilder.buildUserScorecard({
            name: scorecard.name,
            level: scorecard.level + addOneLevel.level,
            earnedPix: scorecard.earnedPix + addOneLevel.pix,
            exactlyEarnedPix: scorecard.exactlyEarnedPix + addOneLevel.pix,
          });
          scorecardService.computeScorecard
            .onFirstCall()
            .resolves(scorecard)
            .onSecondCall()
            .resolves(scorecardAfterAnswer);
          const expectedLevel = scorecardAfterAnswer.level;

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(result.levelup).to.deep.equal({
            id: result.id,
            competenceName: scorecard.name,
            level: expectedLevel,
          });
        });

        it('should return an empty levelup when not gaining a level', async function () {
          scorecardService.computeScorecard.onFirstCall().resolves(scorecard).onSecondCall().resolves(scorecard);

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', function () {
        it('should not compute the level up', async function () {
          // given
          answer = domainBuilder.buildAnswer({ value: '' });
          answer.id = undefined;
          answer.result = undefined;
          answer.resultDetails = undefined;

          // when
          await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(scorecardService.computeScorecard).to.not.have.been.called;
        });
      });
    });

    context('and assessment is a CAMPAIGN with SMART_RANDOM method', function () {
      let firstKnowledgeElement;
      let secondKnowledgeElement;
      let scorecard,
        knowledgeElement,
        targetProfile,
        skills,
        challenge,
        skillAlreadyValidated,
        skillNotAlreadyValidated;

      beforeEach(function () {
        // given
        assessment.type = Assessment.types.CAMPAIGN;
        assessment.method = Assessment.methods.SMART_RANDOM;
        assessment.campaignParticipationId = 123;
        assessmentRepository.get.resolves(assessment);
        skills = domainBuilder.buildSkillCollection({ minLevel: 1, maxLevel: 4 });
        skillAlreadyValidated = skills[0];
        skillNotAlreadyValidated = skills[2];
        challenge = domainBuilder.buildChallenge({
          skill: skillNotAlreadyValidated,
          id: answer.challengeId,
          validator,
        });

        knowledgeElement = domainBuilder.buildKnowledgeElement({
          status: 'validated',
          skillId: skillAlreadyValidated.id,
        });
        firstKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2 });
        secondKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1.8 });
        scorecard = domainBuilder.buildUserScorecard({ level: 2, earnedPix: 20, exactlyEarnedPix: 20.2 });
        targetProfile = domainBuilder.buildTargetProfile({ skills });
        challengeRepository.get.resolves(challenge);

        knowledgeElementRepository.findUniqByUserIdAndAssessmentId
          .withArgs({ userId: assessment.userId, assessmentId: assessment.id })
          .resolves([knowledgeElement]);

        targetProfileRepository.getByCampaignParticipationId.resolves(targetProfile);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([firstKnowledgeElement, secondKnowledgeElement]);
        scorecardService.computeScorecard.resolves(scorecard);
      });

      it('should call the answer repository to save the answer', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });
        // then
        const expectedArgs = [[completedAnswer, [firstKnowledgeElement, secondKnowledgeElement]]];
        expect(answerRepository.saveWithKnowledgeElements.args).to.deep.equal(expectedArgs);
      });

      it('should call the target profile repository to find target skills', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = { campaignParticipationId: assessment.campaignParticipationId };
        expect(targetProfileRepository.getByCampaignParticipationId).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should create the knowledge elements for the answer', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
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
          userId: assessment.userId,
        };
        expect(KnowledgeElement.createKnowledgeElementsForAnswer).to.have.been.calledWith(expectedArgument);
      });

      it('should return the saved answer - with the id', async function () {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      context('when the user responds correctly', function () {
        it('should add the level up to the answer when the user gain one level', async function () {
          // given
          const scorecardAfterAnswer = domainBuilder.buildUserScorecard({
            name: scorecard.name,
            level: scorecard.level + addOneLevel.level,
            earnedPix: scorecard.earnedPix + addOneLevel.pix,
            exactlyEarnedPix: scorecard.exactlyEarnedPix + addOneLevel.pix,
          });
          scorecardService.computeScorecard
            .onFirstCall()
            .resolves(scorecard)
            .onSecondCall()
            .resolves(scorecardAfterAnswer);
          const expectedLevel = scorecardAfterAnswer.level;
          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(result.levelup).to.deep.equal({
            id: result.id,
            competenceName: scorecard.name,
            level: expectedLevel,
          });
        });

        it('should return an empty levelup when not gaining a level', async function () {
          // given
          scorecardService.computeScorecard.onFirstCall().resolves(scorecard).onSecondCall().resolves(scorecard);

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', function () {
        it('should not compute the level up', async function () {
          // given
          answer = domainBuilder.buildAnswer({ value: '' });
          answer.id = undefined;
          answer.result = undefined;
          answer.resultDetails = undefined;

          // when
          await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(scorecardService.computeScorecard).to.not.have.been.called;
        });
      });
    });

    context('and assessment is a CAMPAIGN with FLASH method', function () {
      let firstKnowledgeElement;
      let secondKnowledgeElement;
      let scorecard,
        knowledgeElement,
        targetProfile,
        skills,
        challenge,
        skillAlreadyValidated,
        skillNotAlreadyValidated;
      let flashData;
      const estimatedLevel = 1.93274982;
      const errorRate = 0.9127398127;

      beforeEach(function () {
        // given
        assessment.type = Assessment.types.CAMPAIGN;
        assessment.method = Assessment.methods.FLASH;
        assessment.campaignParticipationId = 123;
        assessmentRepository.get.resolves(assessment);
        skills = domainBuilder.buildSkillCollection({ minLevel: 1, maxLevel: 4 });
        skillAlreadyValidated = skills[0];
        skillNotAlreadyValidated = skills[2];
        challenge = domainBuilder.buildChallenge({
          skill: skillNotAlreadyValidated,
          id: answer.challengeId,
          validator,
        });

        knowledgeElement = domainBuilder.buildKnowledgeElement({
          status: 'validated',
          skillId: skillAlreadyValidated.id,
        });
        firstKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2 });
        secondKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1.8 });
        scorecard = domainBuilder.buildUserScorecard({ level: 2, earnedPix: 20, exactlyEarnedPix: 20.2 });
        targetProfile = domainBuilder.buildTargetProfile({ skills });
        challengeRepository.get.resolves(challenge);

        knowledgeElementRepository.findUniqByUserIdAndAssessmentId
          .withArgs({ userId: assessment.userId, assessmentId: assessment.id })
          .resolves([knowledgeElement]);

        targetProfileRepository.getByCampaignParticipationId.resolves(targetProfile);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([firstKnowledgeElement, secondKnowledgeElement]);
        scorecardService.computeScorecard.resolves(scorecard);

        flashData = Symbol('flashData');
        algorithmDataFetcherService.fetchForFlashLevelEstimation.returns(flashData);
        flashAlgorithmService.getEstimatedLevelAndErrorRate.returns({
          estimatedLevel,
          errorRate,
        });
      });

      it('should call the answer repository to save the answer', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });
        // then
        const expectedArgs = [[completedAnswer, []]];
        expect(answerRepository.saveWithKnowledgeElements.args).to.deep.equal(expectedArgs);
      });

      it('should not call the target profile repository to find target skills', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        expect(targetProfileRepository.getByCampaignParticipationId).to.not.have.been.called;
      });

      it('should call the challenge repository to get the answer challenge', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should not create the knowledge elements for the answer', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const answerCreated = domainBuilder.buildAnswer(savedAnswer);
        answerCreated.id = undefined;
        expect(KnowledgeElement.createKnowledgeElementsForAnswer).to.not.have.been.called;
      });

      it('should return the saved answer - with the id', async function () {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      it('should call the algorithm data fetcher for level estimation', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        expect(algorithmDataFetcherService.fetchForFlashLevelEstimation).to.have.been.calledWith({
          assessment,
          answerRepository,
          challengeRepository,
        });
      });

      it('should call the flash algorithm to estimate level and error rate', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        expect(flashAlgorithmService.getEstimatedLevelAndErrorRate).to.have.been.calledWith(flashData);
      });

      it('should call the flash assessment result repository to save estimatedLevel and errorRate', async function () {
        // when
        const { id } = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        expect(flashAssessmentResultRepository.save).to.have.been.calledWith({
          answerId: id,
          estimatedLevel,
          errorRate,
          assessmentId: assessment.id,
        });
      });

      context('when the user responds correctly', function () {
        it('should not add the level up to the answer when the user gain one level', async function () {
          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', function () {
        it('should not compute the level up', async function () {
          // given
          answer = domainBuilder.buildAnswer({ value: '' });
          answer.id = undefined;
          answer.result = undefined;
          answer.resultDetails = undefined;

          // when
          await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            ...dependencies,
          });

          // then
          expect(scorecardService.computeScorecard).to.not.have.been.called;
        });
      });
    });

    context('and assessment is a nor a CAMPAIGN nor a COMPETENCE_EVALUATION', function () {
      let answer;
      let assessment;
      let challenge;
      let completedAnswer;
      let correctAnswerValue;
      let savedAnswer;
      let solution;
      let validator;

      beforeEach(function () {
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
        completedAnswer.timeSpent = 0;
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        assessment = domainBuilder.buildAssessment({
          userId,
          type: Assessment.types.CERTIFICATION,
          lastQuestionDate: nowDate,
        });

        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.saveWithKnowledgeElements.resolves(savedAnswer);
      });

      it('should call the answer repository to save the answer', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = completedAnswer;
        expect(answerRepository.saveWithKnowledgeElements).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should not call the compute scorecard method', async function () {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        expect(scorecardService.computeScorecard).to.not.have.been.called;
      });

      it('should return the saved answer - with the id', async function () {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });
    });
  });

  context('when the user which want to save the answer is not the right user', function () {
    let answer;
    let assessment;

    beforeEach(function () {
      answer = domainBuilder.buildAnswer();
      assessment = domainBuilder.buildAssessment({ userId: userId + 1 });
      assessmentRepository.get.resolves(assessment);
    });

    it('should throw an error if no userId is passed', function () {
      // when
      const result = correctAnswerThenUpdateAssessment({
        answer,
        userId,
        ...dependencies,
      });

      // then
      return expect(result).to.be.rejectedWith(ForbiddenAccess);
    });
  });

  context('compute the timeSpent and save it on the answer', function () {
    let answer;
    let assessment;
    let answerSaved;

    it('compute the timeSpent', async function () {
      answer = domainBuilder.buildAnswer({ timeSpent: null });
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
      });
      assessment.type = Assessment.types.CERTIFICATION;
      assessmentRepository.get.resolves(assessment);
      answerSaved = domainBuilder.buildAnswer(answer);
      answerSaved.timeSpent = 5;
      answerRepository.saveWithKnowledgeElements.resolves(answerSaved);

      await correctAnswerThenUpdateAssessment({
        answer,
        userId,
        ...dependencies,
      });

      const expectedAnswer = domainBuilder.buildAnswer(answer);
      expectedAnswer.timeSpent = 5;
      expect(answerRepository.saveWithKnowledgeElements).to.be.calledWith(expectedAnswer);
    });

    context('when assessment type is preview', function () {
      it('compute timeSpent=0 when the assessment does not have a lastQuestionDate', async function () {
        answer = domainBuilder.buildAnswer({ timeSpent: null });
        assessment = domainBuilder.buildAssessment({
          userId,
          lastQuestionDate: null,
        });
        assessment.type = Assessment.types.PREVIEW;
        assessmentRepository.get.resolves(assessment);
        answerSaved = domainBuilder.buildAnswer(answer);
        answerRepository.saveWithKnowledgeElements.resolves(answerSaved);

        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          ...dependencies,
        });

        const expectedAnswer = domainBuilder.buildAnswer(answer);
        expectedAnswer.timeSpent = 0;
        expect(answerRepository.saveWithKnowledgeElements).to.be.calledWith(expectedAnswer);
      });
    });
  });

  context('when the challenge is not focused', function () {
    let focusedOutAnswer;
    let assessment;
    let answerSaved;

    beforeEach(function () {
      // Given
      focusedOutAnswer = domainBuilder.buildAnswer({ isFocusedOut: true });
      const nonFocusedChallenge = domainBuilder.buildChallenge({
        id: focusedOutAnswer.challengeId,
        validator,
        focused: false,
      });
      challengeRepository.get.resolves(nonFocusedChallenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CERTIFICATION,
      });
      assessmentRepository.get.resolves(assessment);
      answerSaved = domainBuilder.buildAnswer(focusedOutAnswer);
      answerRepository.saveWithKnowledgeElements.resolves(answerSaved);
    });

    it('should not return focused out answer', async function () {
      // When
      const { result } = await correctAnswerThenUpdateAssessment({
        answer: focusedOutAnswer,
        userId,
        ...dependencies,
      });

      // Then
      expect(result).not.to.equal(AnswerStatus.FOCUSEDOUT);
      expect(result).to.deep.equal(AnswerStatus.OK);
    });
  });

  context('when the challenge is focused in certification', function () {
    let answer;
    let assessment;

    beforeEach(function () {
      // Given
      answer = domainBuilder.buildAnswer({});
      const nonFocusedChallenge = domainBuilder.buildChallenge({
        id: answer.challengeId,
        validator,
        focused: true,
      });
      challengeRepository.get.resolves(nonFocusedChallenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CERTIFICATION,
      });
      assessmentRepository.get.resolves(assessment);
    });

    /* eslint-disable mocha/no-setup-in-describe */
    [
      {
        isFocusedOut: true,
        lastQuestionState: 'focusedout',
        expected: { result: AnswerStatus.FOCUSEDOUT, isFocusedOut: true },
      },
      {
        isFocusedOut: false,
        lastQuestionState: 'asked',
        expected: { result: AnswerStatus.OK, isFocusedOut: false },
      },
      {
        isFocusedOut: false,
        lastQuestionState: 'focusedout',
        expected: { result: AnswerStatus.FOCUSEDOUT, isFocusedOut: true },
      },
      {
        isFocusedOut: true,
        lastQuestionState: 'asked',
        expected: { result: AnswerStatus.FOCUSEDOUT, isFocusedOut: true },
      },
    ].forEach(({ isFocusedOut, lastQuestionState, expected }) => {
      context(`when answer.isFocusedOut=${isFocusedOut} and lastQuestionState=${lastQuestionState}`, function () {
        it(`should return result=${expected.result.status} and isFocusedOut=${expected.isFocusedOut}`, async function () {
          // Given
          answer.isFocusedOut = isFocusedOut;
          assessment.lastQuestionState = lastQuestionState;
          answerRepository.saveWithKnowledgeElements = (_) => _;

          // When
          const correctedAnswer = await correctAnswerThenUpdateAssessment({
            answer: answer,
            userId,
            ...dependencies,
          });

          // Then
          expect(correctedAnswer).to.deep.contain(expected);
        });
      });
    });
    /* eslint-enable mocha/no-setup-in-describe */
  });
});
