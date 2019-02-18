const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const answerController = require('../../../../lib/application/answers/answer-controller');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const answerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/answer-serializer');
const logger = require('../../../../lib/infrastructure/logger');
const usecases = require('../../../../lib/domain/usecases');
const smartPlacementAssessmentRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-assessment-repository');
const { ChallengeAlreadyAnsweredError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | answer-controller', () => {

  beforeEach(() => {

    sinon.stub(answerSerializer, 'serialize');
    sinon.stub(answerRepository, 'getByChallengeAndAssessment');
    sinon.stub(smartPlacementAssessmentRepository, 'get');
    sinon.stub(usecases, 'correctAnswerThenUpdateAssessment');
    sinon.stub(logger, 'error');
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
      deserializedAnswer = domainBuilder.buildAnswer({
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

    context('when answer does not exist', async () => {

      let createdAnswer;
      let response;

      beforeEach(async () => {
        // given

        deserializedAnswer.id = undefined;
        createdAnswer = domainBuilder.buildAnswer({ assessmentId });

        answerSerializer.serialize.returns(serializedAnswer);
        usecases.correctAnswerThenUpdateAssessment.resolves(createdAnswer);

        // when
        response = await answerController.save(request, hFake);
      });

      it('should call the usecase to save the answer', () => {
        // then
        expect(usecases.correctAnswerThenUpdateAssessment)
          .to.have.been.calledWith({ answer: deserializedAnswer });
      });
      it('should serialize the answer', () => {
        // then
        expect(answerSerializer.serialize)
          .to.have.been.calledWith(createdAnswer);
      });
      it('should return the serialized answer', () => {
        // then
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when answer already exists', () => {

      let error;
      let response;

      beforeEach(async () => {
        // given
        error = new ChallengeAlreadyAnsweredError();
        usecases.correctAnswerThenUpdateAssessment.rejects(error);

        // when
        response = await answerController.save(request, hFake);
      });

      it('should call the usecase to save the answer', () => {
        // then
        expect(usecases.correctAnswerThenUpdateAssessment)
          .to.have.been.calledWith({ answer: deserializedAnswer });
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
        expect(response.source).to.deep.equal(jsonAPIError);
        expect(response.statusCode).to.equal(409);
      });
    });

    context('when a unexpected error happens', () => {

      let error;
      let response;

      beforeEach(async () => {
        // given
        error = new Error();
        usecases.correctAnswerThenUpdateAssessment.rejects(error);

        // when
        response = await answerController.save(request, hFake);
      });

      it('should call the usecase to save the answer', () => {
        // then
        return expect(usecases.correctAnswerThenUpdateAssessment)
          .to.have.been.calledWith({ answer: deserializedAnswer });
      });
      it('should log the error', () => {
        // then
        expect(logger.error).to.have.been.calledWith(error);
      });
      it('should return a 500 jsonAPIError', () => {
        // then
        const jsonAPIError = {
          errors: [{
            code: '500',
            title: 'Internal Server Error',
          }],
        };
        expect(response.source).to.deep.equal(jsonAPIError);
        expect(response.statusCode).to.equal(500);
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
      let response;
      let assessment;

      beforeEach(async () => {
        // given
        existingAnswer = domainBuilder.buildAnswer({
          id: answerId,
          value,
          result,
          timeout,
          resultDetails,
          elapsedTime,
          assessmentId,
          challengeId,
        });
        assessment = domainBuilder.buildSmartPlacementAssessment({ id: assessmentId });

        answerRepository.getByChallengeAndAssessment.resolves(existingAnswer);
        smartPlacementAssessmentRepository.get.resolves(assessment);

        // when
        response = await answerController.update(request, hFake);
      });

      it('should get existing answer', () => {
        // then
        return expect(answerRepository.getByChallengeAndAssessment)
          .to.have.been.calledWith({ challengeId, assessmentId });
      });

      it('should call the smartPlacementAssessmentRepository to try and get the assessment', () => {
        // then
        return expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(assessmentId);
      });

      it('should return no content', () => {
        // then
        expect(response).to.be.null;
      });
    });
  });
});
