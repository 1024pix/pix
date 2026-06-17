import sinon from 'sinon';

import * as correctionService from '../../../../../src/evaluation/domain/services/correction-service.js';
import { saveAndCorrectAnswerForCompetenceEvaluation } from '../../../../../src/evaluation/domain/usecases/save-and-correct-answer-for-competence-evaluation.js';
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

describe('Unit | Evaluation | Domain | Use Cases | save-and-correct-answer-for-competence-evaluation', function () {
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
    skillRepository,
    scorecardService,
    knowledgeElementRepository,
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
    skillRepository = { findActiveByCompetenceId: sinon.stub() };
    scorecardService = { computeLevelUpInformation: sinon.stub() };
    competenceRepository = { get: sinon.stub() };
    areaRepository = { get: sinon.stub() };
    competenceEvaluationRepository = { findByUserId: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserId: sinon.stub(), batchSave: sinon.stub() };
    answerJobRepository = {
      performAsync: sinon.stub(),
    };
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
      type: Assessment.types.COMPETENCE_EVALUATION,
      answers: [],
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
      skillRepository,
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
      assessment = domainBuilder.buildAssessment({ userId: userId + 1, answers: [] });
    });

    it('should throw an error if no userId is passed', function () {
      // when
      const result = saveAndCorrectAnswerForCompetenceEvaluation({
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
      const error = await catchErr(saveAndCorrectAnswerForCompetenceEvaluation)({
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
      const error = await catchErr(saveAndCorrectAnswerForCompetenceEvaluation)({
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
        answers: [],
      });
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([]);

      // when
      const error = await catchErr(saveAndCorrectAnswerForCompetenceEvaluation)({
        answer: emptyAnswer,
        userId,
        locale,
        assessment,
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
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([]);
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      challengeRepository.get.resolves(challenge);
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        type: Assessment.types.COMPETENCE_EVALUATION,
        answers: [],
      });
      const answerSaved = domainBuilder.buildAnswer(emptyAnswer);
      answerRepository.save.resolves(answerSaved);
      knowledgeElementRepository.batchSave.resolves();

      // when
      const { result } = await saveAndCorrectAnswerForCompetenceEvaluation({
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
    let knowledgeElement;
    let firstCreatedKnowledgeElement;
    let secondCreatedKnowledgeElement;
    let skills;

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
      assessment.competenceId = 'recABCD';
      knowledgeElement = domainBuilder.buildKnowledgeElement();
      firstCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ answerId: savedAnswer.id, earnedPix: 2 });
      secondCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ answerId: savedAnswer.id, earnedPix: 1 });
      skills = domainBuilder.buildSkillCollection();
      skillRepository.findActiveByCompetenceId.withArgs(assessment.competenceId).resolves(skills);
      challengeRepository.get.resolves(challenge);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([knowledgeElement]);
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([
        firstCreatedKnowledgeElement,
        secondCreatedKnowledgeElement,
      ]);
      scorecardService.computeLevelUpInformation.resolves({});
    });

    it('should save the answer and the knowledge elements', async function () {
      // when
      await saveAndCorrectAnswerForCompetenceEvaluation({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(answerRepository.save).to.be.calledWith({ answer: completedAnswer });
      expect(knowledgeElementRepository.batchSave).to.be.calledWith({
        knowledgeElements: [firstCreatedKnowledgeElement, secondCreatedKnowledgeElement],
      });
    });

    context('when there is no user ID', function () {
      beforeEach(function () {
        // given
        knowledgeElementRepository.findUniqByUserId.withArgs({ userId: null }).resolves([]);
      });

      it('should not call performAsync from answerJobRepository', async function () {
        // given
        assessment.userId = null;

        // when
        await saveAndCorrectAnswerForCompetenceEvaluation({
          answer,
          userId: null,
          assessment,
          locale,
          ...dependencies,
        });

        // then
        expect(answerJobRepository.performAsync).not.to.have.been.called;
      });
    });

    it('should call performAsync from answerJobRepository', async function () {
      // given
      answerJobRepository.performAsync.resolves();

      // when
      await saveAndCorrectAnswerForCompetenceEvaluation({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(answerJobRepository.performAsync).to.have.been.calledWith(new AnswerJob({ userId }));
    });

    it('should call repositories to get needed information', async function () {
      // when
      await saveAndCorrectAnswerForCompetenceEvaluation({
        answer,
        userId,
        assessment,
        locale,
        ...dependencies,
      });

      // then
      expect(skillRepository.findActiveByCompetenceId).to.have.been.calledWithExactly(assessment.competenceId);
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWithExactly({
        userId: assessment.userId,
      });
    });

    it('should return the saved answer - with the id', async function () {
      // when
      const result = await saveAndCorrectAnswerForCompetenceEvaluation({
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
        const result = await saveAndCorrectAnswerForCompetenceEvaluation({
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
        const result = await saveAndCorrectAnswerForCompetenceEvaluation({
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

  context('compute the timeSpent and save it on the answer', function () {
    let answer;
    let answerSaved;

    it('compute the timeSpent', async function () {
      answer = domainBuilder.buildAnswer({ timeSpent: null });
      assessment = domainBuilder.buildAssessment({
        userId,
        lastQuestionDate: new Date('2021-03-11T11:00:00Z'),
        answers: [],
      });
      answerSaved = domainBuilder.buildAnswer(answer);
      answerSaved.timeSpent = 5;
      KnowledgeElement.createKnowledgeElementsForAnswer.returns([]);
      knowledgeElementRepository.findUniqByUserId.withArgs({ userId: assessment.userId }).resolves([]);
      answerRepository.save.resolves(answerSaved);
      knowledgeElementRepository.batchSave.resolves();

      await saveAndCorrectAnswerForCompetenceEvaluation({
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
