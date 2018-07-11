const { expect, sinon, factory } = require('../../../test-helper');

const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

const useCase = require('../../../../lib/domain/usecases');

const { ChallengeAlreadyAnsweredError, NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | save-answer-and-create-associated-knowledge-elements', () => {

  let sandbox;

  const answerRepository = {
    hasChallengeAlreadyBeenAnswered: () => undefined,
    save: () => undefined,
  };
  const challengeRepository = { get: () => undefined };
  const smartPlacementAssessmentRepository = { get: () => undefined };
  const smartPlacementKnowledgeElementRepository = { save: () => undefined };
  const solutionRepository = { getByChallengeId: () => undefined };
  const solutionService = { validate: () => undefined };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(answerRepository, 'hasChallengeAlreadyBeenAnswered');
    sandbox.stub(answerRepository, 'save');
    sandbox.stub(challengeRepository, 'get');
    sandbox.stub(solutionRepository, 'getByChallengeId');
    sandbox.stub(solutionService, 'validate');
    sandbox.stub(smartPlacementAssessmentRepository, 'get');
    sandbox.stub(smartPlacementKnowledgeElementRepository, 'save');
    sandbox.stub(SmartPlacementKnowledgeElement, 'createKnowledgeElementsForAnswer');
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
        challengeRepository,
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
      smartPlacementAssessmentRepository.get.rejects(new NotFoundError());

      // when
      promise = useCase.saveAnswerAndCreateAssociatedKnowledgeElements({
        answer,
        answerRepository,
        challengeRepository,
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

  context('when no answer exists and assessment is a SMART_PLACEMENT', () => {

    let promise;

    let answer;
    let assessment;
    let challenge;
    let completedAnswer;
    let firstKnowledgeElement;
    let savedAnswer;
    let secondKnowledgeElement;
    let solution;
    let validation;

    beforeEach(() => {
      // given
      answer = factory.buildAnswer();
      answer.id = undefined;
      answer.result = undefined;
      answer.resultDetails = undefined;

      challenge = factory.buildChallenge({ id: answer.challengeId });
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

      assessment = factory.buildSmartPlacementAssessment();
      firstKnowledgeElement = factory.buildSmartPlacementKnowledgeElement();
      secondKnowledgeElement = factory.buildSmartPlacementKnowledgeElement();

      answerRepository.hasChallengeAlreadyBeenAnswered.resolves(false);
      challengeRepository.get.resolves(challenge);
      solutionRepository.getByChallengeId.resolves(solution);
      solutionService.validate.returns(validation);
      answerRepository.save.resolves(savedAnswer);
      smartPlacementAssessmentRepository.get.resolves(assessment);
      SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer.returns([
        firstKnowledgeElement, secondKnowledgeElement,
      ]);

      // when
      promise = useCase.saveAnswerAndCreateAssociatedKnowledgeElements({
        answer,
        answerRepository,
        challengeRepository,
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
    it('should call the challenge repository to get the answer challenge', () => {
      // then
      const expectedArgument = answer.challengeId;
      return promise.catch((error) => error)
        .then(() => {
          return expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
        });
    });
    it('should create the knowledge elements for the answer', () => {
      // then
      const expectedArgument = {
        answer: savedAnswer,
        associatedChallenge: challenge,
        previouslyFailedSkills: assessment.failedSkills,
        previouslyValidatedSkills: assessment.validatedSkills,
        targetSkills: assessment.targetProfile.skills,
      };
      return promise.catch((error) => error)
        .then(() => {
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
      return promise.catch((error) => error)
        .then(() => expect(smartPlacementKnowledgeElementRepository.save.args).to.deep.equal(expectedArgs));
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
