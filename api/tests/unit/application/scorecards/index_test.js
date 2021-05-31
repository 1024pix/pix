const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');
const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');
const moduleUnderTest = require('../../../../lib/application/scorecards');

describe('Unit | Router | scorecard-router', () => {

  describe('GET /api/scorecards/{id}', () => {

    it('should exist', async () => {
      // given
      sinon.stub(scorecardController, 'getScorecard').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const options = {
        method: 'GET',
        url: '/api/scorecards/foo',
      };

      // when
      const response = await httpTestServer.request(options.method, options.url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/scorecards/{id}/tutorials', () => {

    it('should exist', async () => {
      // given
      sinon.stub(scorecardController, 'findTutorials').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const options = {
        method: 'GET',
        url: '/api/scorecards/foo/tutorials',
      };

      // when
      const response = await httpTestServer.request(options.method, options.url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
