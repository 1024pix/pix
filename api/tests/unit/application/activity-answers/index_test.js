import { activityAnswerController } from '../../../../lib/application/activity-answers/activity-answer-controller.js';
import * as moduleUnderTest from '../../../../lib/application/activity-answers/index.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Router | activity-answer-router', function () {
  describe('POST /api/pix1d/activity-answers', function () {
    it('should return 201', async function () {
      // given
      sinon.stub(activityAnswerController, 'save').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          attributes: {
            value: 'test',
            result: null,
            'result-details': null,
          },
          relationships: {
            challenge: {
              data: {
                id: 'hee',
              },
            },
          },
          type: 'activity-answers',
        },
        meta: {
          assessmentId: '12345678',
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/pix1d/activity-answers', payload);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
