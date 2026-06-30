import sinon from 'sinon';

import { scorecardsRoute as moduleUnderTest } from '../../../../../src/evaluation/application/scorecards/index.js';
import { scorecardController } from '../../../../../src/evaluation/application/scorecards/scorecard-controller.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

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

  describe('POST /api/users/{userId}/competences/{competenceId}/reset', function () {
    it('should exist', async function () {
      // given
      sinon.stub(scorecardController, 'resetScorecard').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const options = {
        method: 'POST',
        url: '/api/users/1/competences/comp1234/reset',
      };

      // when
      const response = await httpTestServer.request(options.method, options.url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
