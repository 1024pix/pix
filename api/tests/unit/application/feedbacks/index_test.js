const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/feedbacks');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

describe('Unit | Router | feedback-router', function () {
  describe('POST /api/feedbacks', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(feedbackController, 'save').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const query = {
        method: 'POST',
        url: '/api/feedbacks',
        payload: {
          data: {
            type: 'feedbacks',
            attributes: {
              content: 'Some content',
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
        },
        auth: null,
        headers: { 'user-agent': 'Firefox rocks' },
      };

      // when
      const response = await httpTestServer.request(query.method, query.url, query.payload, query.auth, query.headers);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
