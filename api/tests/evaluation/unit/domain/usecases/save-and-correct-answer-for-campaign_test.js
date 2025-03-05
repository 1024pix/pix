import { EmptyAnswerError } from '../../../../../src/evaluation/domain/errors.js';
import * as correctionService from '../../../../../src/evaluation/domain/services/correction-service.js';
import { saveAndCorrectAnswerForCampaign } from '../../../../../src/evaluation/domain/usecases/save-and-correct-answer-for-campaign.js';
import { AnswerJob } from '../../../../../src/quest/domain/models/AnwserJob.js';
import { ChallengeNotAskedError } from '../../../../../src/shared/domain/errors.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { AnswerStatus, Assessment, KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Evaluation | Domain | Use Cases | save-and-correct-answer-for-campaign', function () {
  const userId = 1;
  let assessment;
  let challenge;
  let solution;
  let validator;
  let correctAnswerValue;
  let answer;
  let clock;
  let answerRepository,
    challengeRepository,
    competenceRepository,
    areaRepository,
    competenceEvaluationRepository,
    scorecardService,
    knowledgeElementRepository,
    campaignRepository,
    flashAssessmentResultRepository,
    flashAlgorithmService,
    algorithmDataFetcherService,
    answerJobRepository;

  const nowDate = new Date('2021-03-11T11:00:04Z');
  const locale = 'fr';
  const forceOKAnswer = false;

  let dependencies;

  beforeEach(function () {
    nowDate.setMilliseconds(1);
    clock = sinon.useFakeTimers({ now: nowDate, toFake: ['Date'] });
    sinon.stub(KnowledgeElement, 'createKnowledgeElementsForAnswer');
    answerRepository = { saveWithKnowledgeElements: sinon.stub() };
    challengeRepository = { get: sinon.stub() };
    scorecardService = { computeLevelUpInformation: sinon.stub() };
    campaignRepository = { findSkillsByCampaignParticipationId: sinon.stub() };
    flashAssessmentResultRepository = { save: sinon.stub() };
    flashAlgorithmService = { getCapacityAndErrorRate: sinon.stub() };
    algorithmDataFetcherService = { fetchForFlashLevelEstimation: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub() };
    answerJobRepository = {
      performAsync: sinon.stub(),
    };
    competenceRepository = { get: sinon.stub() };
    areaRepository = { get: sinon.stub() };
    competenceEvaluationRepository = { findByUserId: sinon.stub() };
    competenceRepository.get.resolves(domainBuilder.buildCompetence({ id: 'competenceABC123' }));
    areaRepository.get.resolves(domainBuilder.buildArea());
    competenceEvaluationRepository.findByUserId.resolves([
      domainBuilder.buildCompetenceEvaluation({ competenceId: 'rienavoir' }),
      domainBuilder.buildCompetenceEvaluation({ competenceId: 'competenceABC123' }),
    ]);
    const challengeId = 'oneChallengeId';
    assessment = domainBuilder.buildAssessment({
      userId,
      lastQuestionDate: nowDate,
      type: Assessment.types.CAMPAIGN,
      method: Assessment.methods.SMART_RANDOM,
    });
    answer = domainBuilder.buildAnswer({ assessmentId: assessment.id, value: correctAnswerValue, challengeId });
    answer.id = undefined;
    answer.result = undefined;
    answer.resultDetails = undefined;
    correctAnswerValue = '1';
    solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
    validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
    challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });
    challengeRepository.get.resolves(challenge);

    dependencies = {
      forceOKAnswer,
      answerRepository,
      challengeRepository,
      competenceEvaluationRepository,
      campaignRepository,
      flashAssessmentResultRepository,
      flashAlgorithmService,
      algorithmDataFetcherService,
      knowledgeElementRepository,
      scorecardService,
      answerJobRepository,
      correctionService,
      areaRepository,
      competenceRepository,
    };
  });

  afterEach(async function () {
    clock.restore();
  });

  context('when the user which want to save the answer is not the right user', function () {
    let answer;

    beforeEach(function () {
      answer = domainBuilder.buildAnswer();
      assessment = domainBuilder.buildAssessment({ userId: userId + 1 });
    });

    it('should throw an error if no userId is passed', function () {
      // when
      const result = saveAndCorrectAnswerForCampaign({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      return expect(result).to.be.rejectedWith(ForbiddenAccess);
    });
  });

  context('when an answer for that challenge is not for an asked challenge', function () {
    it('should fail because Challenge Not Asked', async function () {
      // given
      assessment.lastChallengeId = 'anotherChallenge';

      // when
      const error = await catchErr(saveAndCorrectAnswerForCampaign)({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(ChallengeNotAskedError);
    });
  });

  context('when a challenge has an empty answer and no timeout', function () {
    it('should throw an error', async function () {
      // Given
      const emptyAnswer = domainBuilder.buildAnswer({ value: '' });
      const challenge = domainBuilder.buildChallenge({
        id: emptyAnswer.challengeId,
        validator,
      });
      challengeRepository.get.resolves(challenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.COMPETENCE_EVALUATION,
      });

      // when
      const error = await catchErr(saveAndCorrectAnswerForCampaign)({
        answer: emptyAnswer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(EmptyAnswerError);
      expect(error.message).to.equal('The answer value cannot be empty');
    });
  });

  context('when a challenge has an empty answer and is timed out', function () {
    it('should not throw an error', async function () {
      // Given
      const emptyAnswer = domainBuilder.buildAnswer({ value: '', timeout: -1 });
      const challenge = domainBuilder.buildChallenge({
        id: emptyAnswer.challengeId,
        validator,
      });
      const skills = domainBuilder.buildSkillCollection();
      campaignRepository.findSkillsByCampaignParticipationId.resolves(skills);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([]);
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      challengeRepository.get.resolves(challenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.COMPETENCE_EVALUATION,
      });
      const answerSaved = domainBuilder.buildAnswer(emptyAnswer);
      answerRepository.saveWithKnowledgeElements.resolves(answerSaved);

      // when
      const { result } = await saveAndCorrectAnswerForCampaign({
        answer: emptyAnswer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(result).not.to.equal(AnswerStatus.TIMEDOUT);
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

    context('and assessment is a CAMPAIGN with SMART_RANDOM method', function () {
      let firstKnowledgeElement;
      let secondKnowledgeElement;
      let knowledgeElement, skills, challenge, skillAlreadyValidated, skillNotAlreadyValidated;

      beforeEach(function () {
        // given
        assessment.type = Assessment.types.CAMPAIGN;
        assessment.method = Assessment.methods.SMART_RANDOM;
        assessment.campaignParticipationId = 123;
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
          assessmentId: assessment.id,
        });
        firstKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2, assessmentId: assessment.id });
        secondKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1.8, assessmentId: assessment.id });
        challengeRepository.get.resolves(challenge);

        knowledgeElementRepository.findUniqByUserId
          .withArgs({ userId: assessment.userId })
          .resolves([knowledgeElement]);
        campaignRepository.findSkillsByCampaignParticipationId.resolves(skills);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([firstKnowledgeElement, secondKnowledgeElement]);
        scorecardService.computeLevelUpInformation.resolves({});
      });

      it('should call the answer repository to save the answer', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });
        // then
        const expectedArgs = [[completedAnswer, [firstKnowledgeElement, secondKnowledgeElement]]];
        expect(answerRepository.saveWithKnowledgeElements.args).to.deep.equal(expectedArgs);
      });

      it('should call the target profile repository to find target skills', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(campaignRepository.findSkillsByCampaignParticipationId).to.have.been.calledWithExactly({
          campaignParticipationId: assessment.campaignParticipationId,
        });
      });

      it('should call the challenge repository to get the answer challenge', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWithExactly(expectedArgument);
      });

      it('should create the knowledge elements for the answer', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
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
          targetSkills: skills,
          userId: assessment.userId,
        };
        expect(KnowledgeElement.createKnowledgeElementsForAnswer).to.have.been.calledWithExactly(expectedArgument);
      });

      it('should return the saved answer - with the id', async function () {
        // when
        const result = await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      context('when the user responds correctly', function () {
        it('should add the level up to the answer', async function () {
          // given
          const levelupInformation = Symbol('levelup');
          scorecardService.computeLevelUpInformation.resolves(levelupInformation);

          // when
          const result = await saveAndCorrectAnswerForCampaign({
            answer,
            userId,
            assessment,
            locale,
            ...dependencies,
          });

          // then
          expect(result.levelup).to.deep.equal(levelupInformation);
        });
      });

      context('when the user responds badly', function () {
        it('should not compute the level up', async function () {
          // given
          const levelupInformation = Symbol('levelup');
          scorecardService.computeLevelUpInformation.resolves(levelupInformation);
          answer = domainBuilder.buildAnswer({ value: 'wrong answer' });
          answer.result = AnswerStatus.KO;
          savedAnswer.result = AnswerStatus.KO;

          // when
          const result = await saveAndCorrectAnswerForCampaign({
            answer,
            userId,
            assessment,
            locale,
            ...dependencies,
          });

          // then
          expect(scorecardService.computeLevelUpInformation).to.not.have.been.called;
          expect(result.levelup).to.deep.equal({});
        });
      });
    });

    context('and assessment is a CAMPAIGN with FLASH method', function () {
      let flashData;
      const locale = 'fr';
      const capacity = 1.93274982;
      const errorRate = 0.9127398127;

      beforeEach(function () {
        // given
        assessment.type = Assessment.types.CAMPAIGN;
        assessment.method = Assessment.methods.FLASH;
        assessment.campaignParticipationId = 123;
        flashData = Symbol('flashData');
        algorithmDataFetcherService.fetchForFlashLevelEstimation.returns(flashData);
        flashAlgorithmService.getCapacityAndErrorRate.returns({
          capacity,
          errorRate,
        });
      });

      it('should call the answer repository to save the answer', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });
        // then
        const expectedArgs = [[completedAnswer, []]];
        expect(answerRepository.saveWithKnowledgeElements.args).to.deep.equal(expectedArgs);
      });

      it('should not call the target profile repository to find target skills', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(campaignRepository.findSkillsByCampaignParticipationId).to.not.have.been.called;
      });

      it('should call the challenge repository to get the answer challenge', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWithExactly(expectedArgument);
      });

      it('should not create the knowledge elements for the answer', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        const answerCreated = domainBuilder.buildAnswer(savedAnswer);
        answerCreated.id = undefined;
        expect(KnowledgeElement.createKnowledgeElementsForAnswer).to.not.have.been.called;
      });

      it('should return the saved answer - with the id', async function () {
        // when
        const result = await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      it('should call the algorithm data fetcher for level estimation', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        expect(algorithmDataFetcherService.fetchForFlashLevelEstimation).to.have.been.calledWithExactly({
          assessment,
          answerRepository,
          challengeRepository,
          locale,
        });
      });

      it('should call the flash algorithm to estimate level and error rate', async function () {
        // when
        await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        expect(flashAlgorithmService.getCapacityAndErrorRate).to.have.been.calledWithExactly(flashData);
      });

      it('should call the flash assessment result repository to save capacity and errorRate', async function () {
        // when
        const { id } = await saveAndCorrectAnswerForCampaign({
          answer,
          userId,
          assessment,
          locale,
          ...dependencies,
        });

        expect(flashAssessmentResultRepository.save).to.have.been.calledWithExactly({
          answerId: id,
          capacity,
          errorRate,
          assessmentId: assessment.id,
        });
      });

      context('when the user responds correctly', function () {
        it('should not compute the level up', async function () {
          // when
          const result = await saveAndCorrectAnswerForCampaign({
            answer,
            userId,
            assessment,
            locale,
            ...dependencies,
          });

          // then
          expect(scorecardService.computeLevelUpInformation).to.not.have.been.called;
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', function () {
        it('should not compute the level up', async function () {
          // given
          answer = domainBuilder.buildAnswer({ value: 'wrong answer' });
          answer.result = AnswerStatus.KO;

          // when
          const result = await saveAndCorrectAnswerForCampaign({
            answer,
            userId,
            assessment,
            locale,
            ...dependencies,
          });

          // then
          expect(scorecardService.computeLevelUpInformation).to.not.have.been.called;
          expect(result.levelup).to.deep.equal({});
        });
      });
    });

    it('should call performAsync from answerJobRepository', async function () {
      // given
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([]);
      answerJobRepository.performAsync.resolves();

      // when
      await saveAndCorrectAnswerForCampaign({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(answerJobRepository.performAsync).to.have.been.calledWith(new AnswerJob({ userId }));
    });
  });

  context('compute the timeSpent and save it on the answer', function () {
    let answer;
    let answerSaved;

    it('compute the timeSpent', async function () {
      answer = domainBuilder.buildAnswer({ timeSpent: null });
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CAMPAIGN,
        method: Assessment.methods.SMART_RANDOM,
      });
      answerSaved = domainBuilder.buildAnswer(answer);
      answerSaved.timeSpent = 5;
      answerRepository.saveWithKnowledgeElements.resolves(answerSaved);
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([]);

      await saveAndCorrectAnswerForCampaign({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      const expectedAnswer = domainBuilder.buildAnswer(answer);
      expectedAnswer.timeSpent = 5;
      expect(answerRepository.saveWithKnowledgeElements).to.be.calledWith(expectedAnswer);
    });
  });
});
