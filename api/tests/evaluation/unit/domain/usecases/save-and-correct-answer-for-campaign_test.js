import sinon from 'sinon';

import * as correctionService from '../../../../../src/evaluation/domain/services/correction-service.js';
import { saveAndCorrectAnswerForCampaign } from '../../../../../src/evaluation/domain/usecases/save-and-correct-answer-for-campaign.js';
import { AnswerJob } from '../../../../../src/quest/domain/models/quests/events/AnwserJob.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import {
  ChallengeAlreadyAnsweredError,
  ChallengeNotAskedError,
  EmptyAnswerError,
} from '../../../../../src/shared/domain/errors.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Evaluation | Domain | Use Cases | save-and-correct-answer-for-campaign', function () {
  const campaignParticipationId = 3;
  const campaignId = 2;
  const userId = 1;
  let assessment;
  let challenge;
  let campaign;
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
    knowledgeElementForParticipationService,
    campaignRepository,
    answerJobRepository;

  const nowDate = new Date('2021-03-11T11:00:04Z');
  const locale = 'fr';
  const forceOKAnswer = false;

  let dependencies;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
    nowDate.setMilliseconds(1);
    clock = sinon.useFakeTimers({ now: nowDate, toFake: ['Date'] });
    sinon.stub(KnowledgeElement, 'createKnowledgeElementsForAnswer');
    answerRepository = { save: sinon.stub() };
    challengeRepository = { get: sinon.stub() };
    scorecardService = { computeLevelUpInformation: sinon.stub() };
    campaign = domainBuilder.buildCampaign({ id: campaignId });
    campaignRepository = {
      findSkillsByCampaignParticipationId: sinon.stub(),
      get: sinon.stub(),
      getCampaignIdByCampaignParticipationId: sinon.stub(),
    };
    knowledgeElementForParticipationService = {
      findUniqByUserOrCampaignParticipationId: sinon.stub(),
      save: sinon.stub(),
    };
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
      campaignParticipationId,
      answers: [],
      campaign,
    });
    campaignRepository.getCampaignIdByCampaignParticipationId
      .withArgs(assessment.campaignParticipationId)
      .resolves(campaignId);
    campaignRepository.get.withArgs(campaignId).resolves(campaign);
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
      knowledgeElementForParticipationService,
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
      assessment = domainBuilder.buildAssessment({ userId: userId + 1, answers: [] });
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

  context('when an answer for that challenge has already been provided', function () {
    it('should fail because ChallengeAlreadyAnsweredError', async function () {
      // given
      assessment.answers = [domainBuilder.buildAnswer({ challengeId: answer.challengeId })];

      // when
      const error = await catchErr(saveAndCorrectAnswerForCampaign)({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(ChallengeAlreadyAnsweredError);
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
        campaignParticipationId: 12,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CAMPAIGN,
        answers: [],
        campaign,
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
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId
        .withArgs({ userId: assessment.userId, campaignParticipationId: assessment.campaignParticipationId })
        .resolves([]);
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      challengeRepository.get.resolves(challenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.CAMPAIGN,
        campaignParticipationId,
        answers: [],
        campaign,
      });
      const answerSaved = domainBuilder.buildAnswer(emptyAnswer);
      answerRepository.save.resolves(answerSaved);
      knowledgeElementForParticipationService.save.resolves();

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
      savedAnswer = domainBuilder.buildAnswer({
        ...completedAnswer,
        id: 'savedAnswerId',
      });
      answerRepository.save.resolves(savedAnswer);
    });

    context('and assessment is a CAMPAIGN with SMART_RANDOM method', function () {
      let firstKnowledgeElement;
      let secondKnowledgeElement;
      let knowledgeElement, skills, challenge, skillAlreadyValidated, skillNotAlreadyValidated;

      beforeEach(function () {
        // given
        assessment.type = Assessment.types.CAMPAIGN;
        assessment.method = Assessment.methods.SMART_RANDOM;
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
        firstKnowledgeElement = domainBuilder.buildKnowledgeElement({
          earnedPix: 2,
          assessmentId: assessment.id,
          answerId: savedAnswer.id,
        });
        secondKnowledgeElement = domainBuilder.buildKnowledgeElement({
          earnedPix: 1.8,
          assessmentId: assessment.id,
          answerId: savedAnswer.id,
        });
        challengeRepository.get.resolves(challenge);

        knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId
          .withArgs({ userId: assessment.userId, campaignParticipationId: assessment.campaignParticipationId })
          .resolves([knowledgeElement]);
        campaignRepository.findSkillsByCampaignParticipationId.resolves(skills);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([firstKnowledgeElement, secondKnowledgeElement]);
        scorecardService.computeLevelUpInformation.resolves({});
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

    it('should call performAsync from answerJobRepository', async function () {
      // given
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId
        .withArgs({ userId: assessment.userId, campaignParticipationId: assessment.campaignParticipationId })
        .resolves([]);
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
        campaignParticipationId,
        answers: [],
        campaign,
      });
      answerSaved = domainBuilder.buildAnswer(answer);
      answerSaved.timeSpent = 5;
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      knowledgeElementForParticipationService.findUniqByUserOrCampaignParticipationId
        .withArgs({ userId: assessment.userId, campaignParticipationId: assessment.campaignParticipationId })
        .resolves([]);
      answerRepository.save.resolves(answerSaved);
      knowledgeElementForParticipationService.save.resolves();

      await saveAndCorrectAnswerForCampaign({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      const expectedAnswer = domainBuilder.buildAnswer(answer);
      expectedAnswer.timeSpent = 5;
      expect(answerRepository.save).to.be.calledWith({ answer: expectedAnswer });
    });
  });
});
