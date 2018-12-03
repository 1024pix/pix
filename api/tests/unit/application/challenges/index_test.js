const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const ChallengeController = require('../../../../lib/application/challenges/challenge-controller');

describe('Unit | Router | challenge-router', function() {

  let server;

  beforeEach(function() {
    server = Hapi.server();

    return server.register(require('../../../../lib/application/challenges'));
  });

  describe('GET /api/challenges/{id}', function() {

    before(function() {
      sinon.stub(ChallengeController, 'get').returns('ok');
    });

    after(function() {
      ChallengeController.get.restore();
    });

    it('should exist', async () => {
      // given
      const options = { method: 'GET', url: '/api/challenges/challenge_id' };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
