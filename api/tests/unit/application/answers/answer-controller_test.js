const { expect, sinon, factory } = require('../../../test-helper');

const answerController = require('../../../../lib/application/answers/answer-controller');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const answerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/answer-serializer');
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
    const certificationId = 154;

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
        params: {
          id: certificationId,
        },
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

    context('when usecase succeds', () => {

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
});

