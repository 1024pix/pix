const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const challengeController = require('../../../../lib/application/challenges/challenge-controller');
const moduleUnderTest = require('../../../../lib/application/challenges');

describe('Unit | Router | challenge-router', function () {
  describe('GET /api/challenges/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(challengeController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/challenges/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
