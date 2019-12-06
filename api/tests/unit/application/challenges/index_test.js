const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const ChallengeController = require('../../../../lib/application/challenges/challenge-controller');
const route = require('../../../../lib/application/challenges');

describe('Unit | Router | challenge-router', function() {

  let server;

  beforeEach(function() {
    server = Hapi.server();
  });

  describe('GET /api/challenges/{id}', function() {

    beforeEach(function() {
      sinon.stub(ChallengeController, 'get').returns('ok');

      return server.register(route);
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
