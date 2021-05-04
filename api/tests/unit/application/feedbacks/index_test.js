const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/feedbacks');

const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

describe('Unit | Router | feedback-router', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(feedbackController, 'save').returns('ok');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/feedbacks', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('POST', '/api/feedbacks');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
