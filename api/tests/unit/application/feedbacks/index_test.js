const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/feedbacks');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

describe('Unit | Router | feedback-router', function () {
  describe('POST /api/feedbacks', function () {
    it('should exist', async function () {
      // given
      sinon.stub(feedbackController, 'save').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/feedbacks');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
