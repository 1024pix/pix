const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/feedbacks');

const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

describe('Unit | Router | feedback-router', () => {

  describe('POST /api/feedbacks', () => {

    it('should exist', async () => {
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
