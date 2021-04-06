const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const scorecardController = require('../../../../lib/application/scorecards/scorecard-controller');
const moduleUnderTest = require('../../../../lib/application/scorecards');

let server;

describe('Unit | Router | scorecard-router', () => {

  describe('GET /api/scorecards/{id}', () => {

    beforeEach(() => {
      sinon.stub(scorecardController, 'getScorecard').returns('ok');
      server = new HttpTestServer(moduleUnderTest);
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/scorecards/foo',
      };

      // when
      const response = await server.request(options.method, options.url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/scorecards/{id}/tutorials', () => {

    beforeEach(() => {
      sinon.stub(scorecardController, 'findTutorials').returns('ok');
      server = new HttpTestServer(moduleUnderTest);
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/scorecards/foo/tutorials',
      };

      // when
      const response = await server.request(options.method, options.url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
