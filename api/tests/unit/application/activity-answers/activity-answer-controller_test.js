import { activityAnswerController } from '../../../../lib/application/activity-answers/activity-answer-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
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
    let createdAnswer;

    let activityAnswerSerializer;
    let deserializedPayload;
    let serializedAnswer;

    let request;
    beforeEach(async function () {
      // given
      resultDetails = Symbol('resultDetails');
      result = Symbol('result');
      serializedAnswer = Symbol('serialized-answer');

      request = {
        payload: Symbol('request-payload'),
      };
      sinon.stub(usecases, 'correctAnswer');
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
      };
      createdAnswer = domainBuilder.buildActivityAnswer({ id: answerId, activityId });
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
      expect(usecases.correctAnswer).to.have.been.calledWith({
        activityAnswer: deserializedPayload.activityAnswer,
        assessmentId,
      });
    });

    it('should return the serialized activity answer', async function () {
      usecases.correctAnswer.resolves(createdAnswer);
      const response = await activityAnswerController.save(request, hFake, {
        activityAnswerSerializer,
      });

      // then
      expect(response.source).to.deep.equal(serializedAnswer);
      expect(response.statusCode).to.equal(201);
    });
  });
});
