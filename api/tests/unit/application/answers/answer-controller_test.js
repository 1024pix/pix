const { expect, sinon, factory } = require('../../../test-helper');

const answerController = require('../../../../lib/application/answers/answer-controller');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const answerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/answer-serializer');
const bookshelfAnswer = require('../../../../lib/infrastructure/data/answer');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const smartPlacementAssessmentRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-assessment-repository');
const smartPlacementKnowledgeElementRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-knowledge-element-repository');
const { ChallengeAlreadyAnsweredError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | answer-controller', () => {

  let sandbox;
  let replyStub;
  let codeStub;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(answerSerializer, 'serialize');
    sandbox.stub(answerRepository, 'findByChallengeAndAssessment');
    sandbox.stub(smartPlacementAssessmentRepository, 'get');
    sandbox.stub(usecases, 'saveAnswerAndCreateAssociatedKnowledgeElements');
    sandbox.stub(logger, 'error');
    codeStub = sinon.stub();
    replyStub = sinon.stub().returns({
      code: codeStub,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#save', () => {

    const answerId = 1212;
    const assessmentId = 12;
    const challengeId = 'recdTpx4c0kPPDTtf';
    const result = null;
    const timeout = null;
    const resultDetails = null;
    const value = 'NumA = "4", NumB = "1", NumC = "3", NumD = "2"';
    const elapsedTime = 1000;

    let request;
    let deserializedAnswer;
    const serializedAnswer = {
      data: {
        type: 'answers',
        id: answerId,
        attributes: {
          value: 'NumA = "4", NumB = "1", NumC = "3", NumD = "2"',
          'result-details': 'resultDetails_value',
          timeout: null,
          'elapsed-time': null,
          result: 'result_value',
        },
        relationships: {
          assessment: {
            data: {
              type: 'assessments',
              id: assessmentId,
            },
          },
          challenge: {
            data: {
              type: 'challenges',
              id: challengeId,
            },
          },
        },
      },
    };

    beforeEach(() => {
      request = {
        payload: {
          data: {
            attributes: {
              value: value,
              result: result,
              timeout: timeout,
              'result-details': resultDetails,
              'elapsed-time': elapsedTime,
            },
            relationships: {
              assessment: {
                data: {
                  type: 'assessments',
                  id: assessmentId,
                },
              },
              challenge: {
                data: {
                  type: 'challenges',
                  id: challengeId,
                },
              },
            },
            type: 'answers',
          },
        },
      };
      deserializedAnswer = factory.buildAnswer({
        elapsedTime,
        result,
        resultDetails,
        timeout,
        value,
        assessmentId,
        challengeId,
      });
      deserializedAnswer.id = undefined;
    });

    context('when answer does not exist', () => {

      let createdAnswer;
      let promise;

      beforeEach(() => {
        // given

        deserializedAnswer.id = undefined;
        createdAnswer = factory.buildAnswer({ assessmentId });

        answerSerializer.serialize.returns(serializedAnswer);
        usecases.saveAnswerAndCreateAssociatedKnowledgeElements.resolves(createdAnswer);

        // when
        promise = answerController.save(request, replyStub);
      });

      it('should call the usecase to save the answer', () => {
        // then
        return promise.then(() => {
          return expect(usecases.saveAnswerAndCreateAssociatedKnowledgeElements)
            .to.have.been.calledWith({
              answer: deserializedAnswer,
              answerRepository,
              challengeRepository,
              smartPlacementAssessmentRepository,
              smartPlacementKnowledgeElementRepository,
            });
        });
      });
      it('should serialize the answer', () => {
        // then
        return promise.then(() => {
          return expect(answerSerializer.serialize)
            .to.have.been.calledWith(createdAnswer);
        });
      });
      it('should return the serialized answer', () => {
        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(serializedAnswer);
          expect(codeStub).to.have.been.calledWith(201);
        });
      });
    });

    context('when answer already exists', () => {

      let error;
      let promise;

      beforeEach(() => {
        // given
        error = new ChallengeAlreadyAnsweredError();
        usecases.saveAnswerAndCreateAssociatedKnowledgeElements.rejects(error);

        // when
        promise = answerController.save(request, replyStub);
      });

      it('should call the usecase to save the answer', () => {
        // then
        return promise.then(() => {
          return expect(usecases.saveAnswerAndCreateAssociatedKnowledgeElements)
            .to.have.been.calledWith({
              answer: deserializedAnswer,
              answerRepository,
              challengeRepository,
              smartPlacementAssessmentRepository,
              smartPlacementKnowledgeElementRepository,
            });
        });
      });
      it('should return a 409 jsonAPIError', () => {
        // then
        const jsonAPIError = {
          errors: [{
            detail: 'This challenge has already been answered.',
            code: '409',
            title: 'Conflict',
          }],
        };
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(jsonAPIError);
          expect(codeStub).to.have.been.calledWith(409);
        });
      });
    });

    context('when a unexpected error happens', () => {

      let error;
      let promise;

      beforeEach(() => {
        // given
        error = new Error();
        usecases.saveAnswerAndCreateAssociatedKnowledgeElements.rejects(error);

        // when
        promise = answerController.save(request, replyStub);
      });

      it('should call the usecase to save the answer', () => {
        // then
        return promise.then(() => {
          return expect(usecases.saveAnswerAndCreateAssociatedKnowledgeElements)
            .to.have.been.calledWith({
              answer: deserializedAnswer,
              answerRepository,
              challengeRepository,
              smartPlacementAssessmentRepository,
              smartPlacementKnowledgeElementRepository,
            });
        });
      });
      it('should log the error', () => {
        // then
        return promise.then(() => {
          expect(logger.error).to.have.been.calledWith(error);
        });
      });
      it('should return a 500 jsonAPIError', () => {
        // then
        const jsonAPIError = {
          errors: [{
            code: '500',
            title: 'Internal Server Error',
          }],
        };
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(jsonAPIError);
          expect(codeStub).to.have.been.calledWith(500);
        });
      });
    });
  });

  describe('#update', () => {

    const answerId = 1212;
    const assessmentId = 12;
    const challengeId = 'recdTpx4c0kPPDTtf';
    const result = null;
    const timeout = null;
    const resultDetails = null;
    const value = 'NumA = "4", NumB = "1", NumC = "3", NumD = "2"';
    const elapsedTime = 1000;

    let request;

    beforeEach(() => {
      request = {
        params: {
          id: answerId,
        },
        payload: {
          data: {
            id: answerId,
            attributes: {
              value: value,
              result: result,
              timeout: timeout,
              'result-details': resultDetails,
              'elapsed-time': elapsedTime,
            },
            relationships: {
              assessment: {
                data: {
                  type: 'assessments',
                  id: assessmentId,
                },
              },
              challenge: {
                data: {
                  type: 'challenges',
                  id: challengeId,
                },
              },
            },
            type: 'answers',
          },
        },
      };
    });

    context('when assessment is a SmartPlacement and Answer exists', () => {

      let existingAnswer;
      let existingBookshelfAnswer;
      let promise;
      let assessment;

      beforeEach(() => {
        // given
        existingAnswer = factory.buildAnswer({
          id: answerId,
          value,
          result,
          timeout,
          resultDetails,
          elapsedTime,
          assessmentId,
          challengeId,
        });
        existingBookshelfAnswer = new bookshelfAnswer({
          id: existingAnswer.id,
          value: existingAnswer.value,
          result: existingAnswer.result,
          resultDetails: existingAnswer.resultDetails,
          timeout: existingAnswer.timeout,
          elapsedTime: existingAnswer.elapsedTime,
          assessmentId: existingAnswer.assessmentId,
          challengeId: existingAnswer.challengeId,
        });

        assessment = factory.buildSmartPlacementAssessment({ id: assessmentId });

        answerRepository.findByChallengeAndAssessment.resolves(existingBookshelfAnswer);
        smartPlacementAssessmentRepository.get.resolves(assessment);

        // when
        promise = answerController.update(request, replyStub);
      });

      it('should succeed', () => {
        return expect(promise).to.be.fulfilled;
      });
      it('should get existing answer', () => {
        // then
        return promise.then(() => {
          return expect(answerRepository.findByChallengeAndAssessment)
            .to.have.been.calledWith(challengeId, assessmentId);
        });
      });
      it('should call the smartPlacementAssessmentRepository to try and get the assessment', () => {
        // then
        return promise.then(() => {
          return expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(assessmentId);
        });
      });
      it('should return no content', () => {
        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith();
          expect(codeStub).to.have.been.calledWith(204);
        });
      });
    });
  });
});

