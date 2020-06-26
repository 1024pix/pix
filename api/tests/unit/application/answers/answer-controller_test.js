const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const answerController = require('../../../../lib/application/answers/answer-controller');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const answerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/answer-serializer');
const correctionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/correction-serializer');
const usecases = require('../../../../lib/domain/usecases');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils');

describe('Unit | Controller | answer-controller', () => {

  beforeEach(() => {

    sinon.stub(answerSerializer, 'serialize');
    sinon.stub(answerRepository, 'findByChallengeAndAssessment');
    sinon.stub(usecases, 'correctAnswerThenUpdateAssessment');
    sinon.stub(requestResponseUtils, 'extractUserIdFromRequest');
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
      const userId = 3;

      beforeEach(async () => {
        // given
        deserializedAnswer.id = undefined;
        createdAnswer = domainBuilder.buildAnswer({ assessmentId });
        answerSerializer.serialize.returns(serializedAnswer);
        usecases.correctAnswerThenUpdateAssessment.resolves(createdAnswer);
        requestResponseUtils.extractUserIdFromRequest.returns(userId);

        // when
        response = await answerController.save(request, hFake);
      });

      it('should call the usecase to save the answer', () => {
        // then
        expect(usecases.correctAnswerThenUpdateAssessment)
          .to.have.been.calledWith({ answer: deserializedAnswer, userId });
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
  });

  describe('#getCorrection', () => {

    const answerId = 1;
    const userId = 'userId';

    beforeEach(() => {
      sinon.stub(usecases, 'getCorrectionForAnswer');
      sinon.stub(correctionSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      requestResponseUtils.extractUserIdFromRequest.returns(userId);
      usecases.getCorrectionForAnswer.withArgs({ answerId, userId }).resolves({});
      correctionSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await answerController.getCorrection({ params: { id: answerId } });

      // then
      expect(response).to.be.equal('ok');
    });

  });

});
