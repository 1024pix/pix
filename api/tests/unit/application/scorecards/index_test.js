const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');
const moduleUnderTest = require('../../../../lib/application/scorecards');

let httpTestServer;

describe('Unit | Router | scorecard-router', () => {

  describe('GET /api/scorecards/{id}', () => {

    beforeEach(async() => {
      sinon.stub(scorecardController, 'getScorecard').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    it('should exist', async () => {
      // given
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

    beforeEach(async() => {
      sinon.stub(scorecardController, 'findTutorials').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    it('should exist', async () => {
      // given
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
