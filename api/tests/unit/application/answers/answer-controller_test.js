import { expect, sinon, domainBuilder, hFake } from '../../../test-helper';
import answerController from '../../../../lib/application/answers/answer-controller';
import answerRepository from '../../../../lib/infrastructure/repositories/answer-repository';
import answerSerializer from '../../../../lib/infrastructure/serializers/jsonapi/answer-serializer';
import correctionSerializer from '../../../../lib/infrastructure/serializers/jsonapi/correction-serializer';
import usecases from '../../../../lib/domain/usecases';
import requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils';

describe('Unit | Controller | answer-controller', function () {
  beforeEach(function () {
    sinon.stub(answerSerializer, 'serialize');
    sinon.stub(answerRepository, 'findByChallengeAndAssessment');
    sinon.stub(usecases, 'correctAnswerThenUpdateAssessment');
    sinon.stub(requestResponseUtils, 'extractUserIdFromRequest');
    sinon.stub(requestResponseUtils, 'extractLocaleFromRequest');
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
        answerSerializer.serialize.returns(serializedAnswer);
        usecases.correctAnswerThenUpdateAssessment.resolves(createdAnswer);
        requestResponseUtils.extractUserIdFromRequest.withArgs(request).returns(userId);
        requestResponseUtils.extractLocaleFromRequest.withArgs(request).returns(locale);

        // when
        response = await answerController.save(request, hFake);
      });

      it('should call the usecase to save the answer', function () {
        // then
        expect(usecases.correctAnswerThenUpdateAssessment).to.have.been.calledWith({
          answer: deserializedAnswer,
          userId,
          locale,
        });
      });

      it('should serialize the answer', function () {
        // then
        expect(answerSerializer.serialize).to.have.been.calledWith(createdAnswer);
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

    beforeEach(function () {
      sinon.stub(usecases, 'getCorrectionForAnswer');
      sinon.stub(correctionSerializer, 'serialize');
    });

    it('should return ok', async function () {
      // given
      requestResponseUtils.extractUserIdFromRequest.returns(userId);
      requestResponseUtils.extractLocaleFromRequest.returns(locale);
      usecases.getCorrectionForAnswer.withArgs({ answerId, userId, locale }).resolves({});
      correctionSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await answerController.getCorrection({ params: { id: answerId } });

      // then
      expect(response).to.be.equal('ok');
    });
  });
});
