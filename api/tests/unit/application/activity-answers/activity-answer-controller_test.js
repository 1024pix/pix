import { activityAnswerController } from '../../../../src/school/application/activity-answer-controller.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | activity-answer-controller', function () {
  describe('#save', function () {
    const answerId = 1212;
    const assessmentId = 12;
    const challengeId = 'recdTpx4c0kPPDTtf';
    const activityId = 25;
    let result;
    const value = 'NumA = "4"';
    let resultDetails;

    let activityAnswerSerializer;
    let deserializedPayload;
    let serializedAnswer;

    let request;

    beforeEach(async function () {
      // given
      sinon.stub(usecases, 'correctPreviewAnswer');
      sinon.stub(usecases, 'handleActivityAnswer');

      resultDetails = Symbol('resultDetails');
      result = Symbol('result');
      serializedAnswer = Symbol('serialized-answer');

      request = {
        payload: Symbol('request-payload'),
      };
    });

    context('when challenge is not in preview', function () {
      let createdAnswer;

      beforeEach(function () {
        deserializedPayload = {
          activityAnswer: domainBuilder.buildActivityAnswer({
            id: undefined,
            challengeId,
            activityId: undefined,
            result,
            resultDetails,
            value,
          }),
          assessmentId,
          isPreview: false,
        };
        createdAnswer = domainBuilder.buildActivityAnswer({ id: answerId, activityId });
        usecases.handleActivityAnswer.resolves(createdAnswer);

        activityAnswerSerializer = {
          serialize: sinon.stub(),
          deserialize: sinon.stub(),
        };
        activityAnswerSerializer.deserialize.withArgs(request.payload).returns(deserializedPayload);
        activityAnswerSerializer.serialize.withArgs(createdAnswer).returns(serializedAnswer);
      });

      it('should call the usecase to save the activity answer', async function () {
        await activityAnswerController.save(request, hFake, {
          activityAnswerSerializer,
        });

        // then
        expect(usecases.handleActivityAnswer).to.have.been.calledWithExactly({
          activityAnswer: deserializedPayload.activityAnswer,
          assessmentId,
        });
        expect(usecases.correctPreviewAnswer).not.to.have.been.calledWith();
      });

      it('should return the serialized activity answer', async function () {
        const response = await activityAnswerController.save(request, hFake, {
          activityAnswerSerializer,
        });

        // then
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(201);
      });
    });
    context('when challenge is in preview', function () {
      let correctedAnswer;

      beforeEach(function () {
        deserializedPayload = {
          activityAnswer: domainBuilder.buildActivityAnswer({
            id: undefined,
            challengeId,
            activityId: undefined,
            result,
            resultDetails,
            value,
          }),
          assessmentId,
          isPreview: true,
        };
        correctedAnswer = domainBuilder.buildActivityAnswer({ id: answerId, activityId });
        usecases.correctPreviewAnswer.resolves(correctedAnswer);

        activityAnswerSerializer = {
          serialize: sinon.stub(),
          deserialize: sinon.stub(),
        };
        activityAnswerSerializer.deserialize.withArgs(request.payload).returns(deserializedPayload);
        activityAnswerSerializer.serialize.withArgs(correctedAnswer).returns(serializedAnswer);
      });

      it('should call the usecase to save the activity answer', async function () {
        await activityAnswerController.save(request, hFake, {
          activityAnswerSerializer,
        });

        // then
        expect(usecases.correctPreviewAnswer).to.have.been.calledWithExactly({
          activityAnswer: deserializedPayload.activityAnswer,
        });
        expect(usecases.handleActivityAnswer).not.to.have.been.calledWith();
      });

      it('should return the serialized activity answer', async function () {
        const response = await activityAnswerController.save(request, hFake, {
          activityAnswerSerializer,
        });

        // then
        expect(response.source).to.deep.equal(serializedAnswer);
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
