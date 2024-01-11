import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { challengeController } from '../../../../../src/shared/application/challenges/challenge-controller.js';
import * as moduleUnderTest from '../../../../../src/shared/application/challenges/index.js';

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
