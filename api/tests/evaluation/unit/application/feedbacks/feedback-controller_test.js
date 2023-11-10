import { expect, sinon, hFake } from '../../../../test-helper.js';
import { feedbackController } from '../../../../../src/evaluation/application/feedbacks/feedback-controller.js';

describe('Unit | Controller | feedback-controller', function () {
  describe('#save', function () {
    let payload;
    let request;
    let h;
    let feedbackSerializerStubs;
    let usecasesStubs;

    beforeEach(function () {
      payload = {
        data: {
          type: 'feedbacks',
          attributes: {
            content: 'Lorem ipsum dolor sit amet consectetur adipiscet.',
          },
          relationships: {
            assessment: {
              data: {
                type: 'assessments',
                id: '1',
              },
            },
            challenge: {
              data: {
                type: 'challenges',
                id: '2',
              },
            },
          },
        },
      };
      request = {
        headers: { 'user-agent': '123' },
        payload: payload,
      };
      h = {
        ...hFake,
      };

      feedbackSerializerStubs = {
        serialize: sinon.stub().resolves(Symbol('serialized-feedback')),
        deserialize: sinon.stub().resolves(Symbol('deserialized-feedback')),
      };

      usecasesStubs = {
        saveFeedback: sinon.stub().resolves(Symbol('saved-feedback')),
      };
    });

    it('should return created status ', async function () {
      // given
      const createdStub = sinon.stub();
      h.response = () => {
        return {
          created: createdStub,
        };
      };

      // when
      await feedbackController.save(request, h, {
        feedBackSerializer: feedbackSerializerStubs,
        usecases: usecasesStubs,
      });

      // then
      expect(createdStub).to.have.been.calledOnce;
    });

    it('should persist feedback data', async function () {
      // when
      await feedbackController.save(request, hFake, {
        feedBackSerializer: feedbackSerializerStubs,
        usecases: usecasesStubs,
      });

      // then
      expect(usecasesStubs.saveFeedback).to.have.been.calledOnce;
    });
  });
});
