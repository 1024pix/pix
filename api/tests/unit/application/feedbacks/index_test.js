const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/feedbacks');

const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');

describe('Unit | Router | feedback-router', function() {

  let httpTestServer;

  beforeEach(function() {
    sinon.stub(feedbackController, 'save').returns('ok');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/feedbacks', function() {

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request('POST', '/api/feedbacks');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
