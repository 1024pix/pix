const { expect, sinon, domainBuilder } = require('../../../test-helper');

const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

const correctAnswerThenUpdateAssessment = require('../../../../lib/domain/usecases/correct-answer-then-update-assessment');

const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | correct-answer-then-update-assessment', () => {

  const answerRepository = {
    hasChallengeAlreadyBeenAnswered: () => undefined,
    save: () => undefined,
  };
  const challengeRepository = { get: () => undefined };
  const smartPlacementAssessmentRepository = { get: () => undefined };
  const smartPlacementKnowledgeElementRepository = { save: () => undefined };

  beforeEach(() => {

    sinon.stub(answerRepository, 'hasChallengeAlreadyBeenAnswered');
    sinon.stub(answerRepository, 'save');
    sinon.stub(challengeRepository, 'get');
    sinon.stub(smartPlacementAssessmentRepository, 'get');
    sinon.stub(smartPlacementKnowledgeElementRepository, 'save');
    sinon.stub(SmartPlacementKnowledgeElement, 'createKnowledgeElementsForAnswer');
  });

  context('when an answer for that challenge and that assessment already exists', () => {

    let answer;
    let promise;

    beforeEach(() => {
      // given
      answer = domainBuilder.buildAnswer();
      answerRepository.hasChallengeAlreadyBeenAnswered.resolves(true);

      // when
      promise = correctAnswerThenUpdateAssessment({
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
      return promise.catch((error) => error)
        .then(() => {
          return expect(answerRepository.hasChallengeAlreadyBeenAnswered).to.have.been.calledWith(expectedArguments);
        });
    });
    it('should fail because Challenge Already Answered', () => {
      // then
      return expect(promise).to.be.rejectedWith(ChallengeAlreadyAnsweredError);
    });
  });

  context('when no answer exists and assessment is not a SMART_PLACEMENT', () => {

    let promise;

    let answer;
    let challenge;
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

      completedAnswer = domainBuilder.buildAnswer(answer);
      completedAnswer.id = undefined;
      completedAnswer.result = AnswerStatus.OK;
      completedAnswer.resultDetails = null;

      savedAnswer = domainBuilder.buildAnswer(completedAnswer);

      answerRepository.hasChallengeAlreadyBeenAnswered.resolves(false);
      challengeRepository.get.resolves(challenge);
      answerRepository.save.resolves(savedAnswer);
      smartPlacementAssessmentRepository.get.rejects(new NotFoundError());

      // when
      promise = correctAnswerThenUpdateAssessment({
        answer,
        answerRepository,
        challengeRepository,
        smartPlacementAssessmentRepository,
        smartPlacementKnowledgeElementRepository,
      });
    });

    it('should succeed', () => {
      // then
      return expect(promise).to.be.fulfilled;
    });
    it('should call the answer repository to check if challenge has already been answered', () => {
      // then
      const expectedArguments = {
        assessmentId: answer.assessmentId,
        challengeId: answer.challengeId,
      };
      return promise.then(() => {
        return expect(answerRepository.hasChallengeAlreadyBeenAnswered).to.have.been.calledWith(expectedArguments);
      });
    });
    it('should call the answer repository to save the answer', () => {
      // then
      return promise.then(() => {
        return expect(answerRepository.save).to.have.been.calledWith(completedAnswer);
      });
    });
    it('should call the smart placement assessment repository to try and get the assessment', () => {
      // then
      const expectedArgument = answer.assessmentId;
      return promise.then(() => {
        return expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(expectedArgument);
      });
    });
    it('should return the saved answer - with the id', () => {
      // then
      const expectedArgument = savedAnswer;
      return promise.then((answer) => {
        return expect(answer).to.deep.equal(expectedArgument);
      });
    });
  });

  context('when no answer exists and assessment is a SMART_PLACEMENT', () => {

    let promise;

    let answer;
    let assessment;
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

      assessment = domainBuilder.buildSmartPlacementAssessment();
      firstKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement();
      secondKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement();

      answerRepository.hasChallengeAlreadyBeenAnswered.resolves(false);
      challengeRepository.get.resolves(challenge);
      answerRepository.save.resolves(savedAnswer);
      smartPlacementAssessmentRepository.get.resolves(assessment);
      SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer.returns([
        firstKnowledgeElement, secondKnowledgeElement,
      ]);

      // when
      promise = correctAnswerThenUpdateAssessment({
        answer,
        answerRepository,
        challengeRepository,
        smartPlacementAssessmentRepository,
        smartPlacementKnowledgeElementRepository,
      });
    });

    it('should succeed', () => {
      // then
      return expect(promise).to.be.fulfilled;
    });
    it('should call the answer repository to check if challenge has already been answered', () => {
      // then
      const expectedArguments = {
        assessmentId: answer.assessmentId,
        challengeId: answer.challengeId,
      };
      return promise.then(() => {
        return expect(answerRepository.hasChallengeAlreadyBeenAnswered).to.have.been.calledWith(expectedArguments);
      });
    });
    it('should call the answer repository to save the answer', () => {
      // then
      const expectedArgument = completedAnswer;
      return promise.then(() => {
        return expect(answerRepository.save).to.have.been.calledWith(expectedArgument);
      });
    });
    it('should call the smart placement assessment repository to try and get the assessment', () => {
      // then
      const expectedArgument = answer.assessmentId;
      return promise.then(() => {
        return expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(expectedArgument);
      });
    });
    it('should call the challenge repository to get the answer challenge', () => {
      // then
      const expectedArgument = answer.challengeId;
      return promise.then(() => {
        return expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });
    });
    it('should create the knowledge elements for the answer', () => {
      // then
      const expectedArgument = {
        answer: savedAnswer,
        challenge: challenge,
        previouslyFailedSkills: assessment.getFailedSkills(),
        previouslyValidatedSkills: assessment.getValidatedSkills(),
        targetSkills: assessment.targetProfile.skills,
      };
      return promise.then(() => {
        return expect(SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer)
          .to.have.been.calledWith(expectedArgument);
      });
    });
    it('should save the newly created knowledge elements', () => {
      // then
      const expectedArgs = [
        [firstKnowledgeElement],
        [secondKnowledgeElement],
      ];
      return promise.then(() => expect(smartPlacementKnowledgeElementRepository.save.args).to.deep.equal(expectedArgs));
    });
    it('should return the saved answer - with the id', () => {
      // then
      const expectedArgument = savedAnswer;
      return promise.then((answer) => {
        return expect(answer).to.deep.equal(expectedArgument);
      });
    });
  });
});
