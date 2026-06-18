import sinon from 'sinon';

import { challengeController } from '../../../../../src/evaluation/application/challenges/challenge-controller.js';
import { challengesRoute as moduleUnderTest } from '../../../../../src/evaluation/application/challenges/index.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Evaluation Unit | Application | challenge-routes', function () {
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
