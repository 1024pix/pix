const { expect, sinon, factory } = require('../../../test-helper');

const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const useCase = require('../../../../lib/domain/usecases');

const { ChallengeAlreadyAnsweredError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | save-answer-and-create-associated-knowledge-elements', () => {

  let sandbox;

  const answerRepository = {
    hasChallengeAlreadyBeenAnswered: () => undefined,
    save: () => undefined,
  };
  const smartPlacementAssessmentRepository = { get: () => undefined };
  const smartPlacementKnowledgeElementRepository = { save: () => undefined };
  const solutionRepository = { getByChallengeId: () => undefined };
  const solutionService = { validate: () => undefined };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(answerRepository, 'hasChallengeAlreadyBeenAnswered');
    sandbox.stub(answerRepository, 'save');
    sandbox.stub(solutionRepository, 'getByChallengeId');
    sandbox.stub(solutionService, 'validate');
    sandbox.stub(smartPlacementAssessmentRepository, 'get');
    sandbox.stub(smartPlacementKnowledgeElementRepository, 'save');
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when an answer for that challenge and that assessment already exists', () => {

    let answer;
    let promise;

    beforeEach(() => {
      // given
      answer = factory.buildAnswer();
      answerRepository.hasChallengeAlreadyBeenAnswered.resolves(true);

      // when
      promise = useCase.saveAnswerAndCreateAssociatedKnowledgeElements({
        answer,
        answerRepository,
        smartPlacementAssessmentRepository,
        smartPlacementKnowledgeElementRepository,
        solutionRepository,
        solutionService,
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
    let completedAnswer;
    let savedAnswer;
    let solution;
    let validation;

    beforeEach(() => {
      // given
      answer = factory.buildAnswer();
      answer.id = undefined;
      answer.result = undefined;
      answer.resultDetails = undefined;

      solution = factory.buildSolution({ id: answer.challengeId });

      validation = {
        result: AnswerStatus.OK,
        resultDetails: null,
      };

      completedAnswer = factory.buildAnswer(answer);
      completedAnswer.id = undefined;
      completedAnswer.result = validation.result;
      completedAnswer.resultDetails = validation.resultDetails;

      savedAnswer = factory.buildAnswer(completedAnswer);

      answerRepository.hasChallengeAlreadyBeenAnswered.resolves(false);
      solutionRepository.getByChallengeId.resolves(solution);
      solutionService.validate.returns(validation);
      answerRepository.save.resolves(savedAnswer);
      smartPlacementAssessmentRepository.get.rejects(new Error());

      // when
      promise = useCase.saveAnswerAndCreateAssociatedKnowledgeElements({
        answer,
        answerRepository,
        smartPlacementAssessmentRepository,
        smartPlacementKnowledgeElementRepository,
        solutionRepository,
        solutionService,
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
    it('should call the solution repository to get the solution the answer’s challenge', () => {
      // then
      const expectedArguments = answer.challengeId;
      return promise.catch((error) => error)
        .then(() => {
          return expect(solutionRepository.getByChallengeId).to.have.been.calledWith(expectedArguments);
        });
    });
    it('should call the solution service to calculate the result status of the answer', () => {
      // then
      return promise.catch((error) => error)
        .then(() => {
          return expect(solutionService.validate).to.have.been.calledWith(answer, solution);
        });
    });
    it('should call the answer repository to save the answer', () => {
      // then
      const expectedArgument = completedAnswer;
      return promise.catch((error) => error)
        .then(() => {
          return expect(answerRepository.save).to.have.been.calledWith(expectedArgument);
        });
    });
    it('should call the smart placement assessment repository to try and get the assessment', () => {
      // then
      const expectedArgument = answer.assessmentId;
      return promise.catch((error) => error)
        .then(() => {
          return expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(expectedArgument);
        });
    });
    it('should return the saved answer - with the id', () => {
      // then
      const expectedArgument = savedAnswer;
      return promise.catch((error) => error)
        .then((answer) => {
          return expect(answer).to.deep.equal(expectedArgument);
        });
    });
  });
});
