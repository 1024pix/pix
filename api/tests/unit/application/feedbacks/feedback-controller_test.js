import { expect, sinon, hFake } from '../../../test-helper.js';

import { feedbackController } from '../../../../lib/application/feedbacks/feedback-controller.js';

describe('Unit | Controller | feedback-controller', function () {
  describe('#save', function () {
    let payload;
    let request;
    let h;
    let usecasesStub;

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

      usecasesStub = {
        saveFeedback: sinon.stub(),
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
      const feedback = Symbol('feedback');
      usecasesStub.saveFeedback.resolves(feedback);

      // when
      await feedbackController.save(request, h, { usecases: usecasesStub });

      // then
      expect(createdStub).to.have.been.calledOnce;
    });

    it('should persist feedback data', async function () {
      // given
      const feedback = Symbol('feedback');
      usecasesStub.saveFeedback.resolves(feedback);

      // when
      await feedbackController.save(request, hFake, { usecases: usecasesStub });

      // then
      expect(usecasesStub.saveFeedback).to.have.been.calledOnce;
    });
  });
});
