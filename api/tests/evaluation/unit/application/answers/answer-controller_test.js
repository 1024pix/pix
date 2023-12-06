import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { answerController } from '../../../../../src/evaluation/application/answers/answer-controller.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';

describe('Unit | Controller | answer-controller', function () {
  let answerSerializerStub;
  let requestResponseUtilsStub;

  beforeEach(function () {
    answerSerializerStub = {
      serialize: sinon.stub(),
      deserialize: sinon.stub(),
    };
    requestResponseUtilsStub = {
      extractUserIdFromRequest: sinon.stub(),
      extractLocaleFromRequest: sinon.stub(),
    };
    sinon.stub(usecases, 'correctAnswerThenUpdateAssessment');
  });

  describe('#save', function () {
    const answerId = 1212;
    const assessmentId = 12;
    const challengeId = 'recdTpx4c0kPPDTtf';
    const result = null;
    const timeout = null;
    const focusedOut = false;
    const resultDetails = null;
    const value = 'NumA = "4", NumB = "1", NumC = "3", NumD = "2"';
    const locale = 'fr-fr';

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
          result: 'result_value',
          'focused-out': focusedOut,
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

    beforeEach(function () {
      request = {
        headers: {
          'accept-language': locale,
        },
        payload: {
          data: {
            attributes: {
              value: value,
              result: result,
              timeout: timeout,
              'focused-out': focusedOut,
              'result-details': resultDetails,
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
        result,
        resultDetails,
        timeout,
        value,
        assessmentId,
        challengeId,
        focusedOut,
      });
      deserializedAnswer.id = undefined;
    });

    context('when answer does not exist', function () {
      let createdAnswer;
      let response;
      const userId = 3;

      beforeEach(async function () {
        // given
        deserializedAnswer.id = undefined;
        deserializedAnswer.timeSpent = undefined;
        createdAnswer = domainBuilder.buildAnswer({ assessmentId });
        answerSerializerStub.serialize.returns(serializedAnswer);
        answerSerializerStub.deserialize.returns(deserializedAnswer);
        usecases.correctAnswerThenUpdateAssessment.resolves(createdAnswer);
        requestResponseUtilsStub.extractUserIdFromRequest.withArgs(request).returns(userId);
        requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

        // when
        response = await answerController.save(request, hFake, {
          answerSerializer: answerSerializerStub,
          requestResponseUtils: requestResponseUtilsStub,
        });
      });

      it('should call the usecase to save the answer', function () {
        // then
        expect(usecases.correctAnswerThenUpdateAssessment).to.have.been.calledWithExactly({
          answer: deserializedAnswer,
          userId,
          locale,
        });
      });

      it('should serialize the answer', function () {
        // then
        expect(answerSerializerStub.serialize).to.have.been.calledWithExactly(createdAnswer);
      });
      it('should return the serialized answer', function () {
        // then
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });
    });
  });
  describe('#getCorrection', function () {
    const answerId = 1;
    const userId = 'userId';
    const locale = 'lang-country';
    let correctionSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'getCorrectionForAnswer');
      correctionSerializerStub = { serialize: sinon.stub() };
    });

    it('should return ok', async function () {
      // given
      requestResponseUtilsStub.extractUserIdFromRequest.returns(userId);
      requestResponseUtilsStub.extractLocaleFromRequest.returns(locale);
      usecases.getCorrectionForAnswer.withArgs({ answerId, userId, locale }).resolves({});
      correctionSerializerStub.serialize.withArgs({}).returns('ok');

      // when
      const response = await answerController.getCorrection({ params: { id: answerId } }, hFake, {
        correctionSerializer: correctionSerializerStub,
        requestResponseUtils: requestResponseUtilsStub,
      });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});
