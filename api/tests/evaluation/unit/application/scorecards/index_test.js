import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { scorecardController } from '../../../../../src/evaluation/application/scorecards/scorecard-controller.js';
import * as moduleUnderTest from '../../../../../src/evaluation/application/scorecards/index.js';

describe('Unit | Router | scorecard-router', function () {
  describe('GET /api/scorecards/{id}', function () {
    it('should exist', async function () {
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

  describe('GET /api/scorecards/{id}/tutorials', function () {
    it('should exist', async function () {
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
