const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const skillReviewController = require('../../../../lib/application/skillReviews/skill-review-controller');

describe('Unit | Router | skill-review-router', () => {

  let server;

  beforeEach(() => {
    sinon.stub(skillReviewController, 'get').callsFake((request, h) => h.response().code(200));

    server = Hapi.server();
    return server.register(require('../../../../lib/application/skillReviews'));
  });

  afterEach(() => {
    skillReviewController.get.restore();

    server.stop();
  });

  describe('GET /api/skill-reviews/{id}', function() {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/skill-reviews/1'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });
});
