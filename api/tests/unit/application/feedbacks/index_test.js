const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const feedbackController = require('../../../../lib/application/feedbacks/feedback-controller');
const route = require('../../../../lib/application/feedbacks');

describe('Unit | Router | feedback-router', () => {

  let server;

  beforeEach(() => {
    server = Hapi.server();
  });

  describe('POST /api/feedbacks', () => {

    beforeEach(() => {
      sinon.stub(feedbackController, 'save').returns('ok');
      return server.register(route);
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/feedbacks'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((result) => {
        expect(result.statusCode).to.equal(200);
      });
    });
  });

});
