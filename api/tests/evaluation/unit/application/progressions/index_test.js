import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { progressionController } from '../../../../../src/evaluation/application/progressions/progression-controller.js';
import * as moduleUnderTest from '../../../../../src/evaluation/application/progressions/index.js';

describe('Unit | Router | progression-router', function () {
  describe('GET /api/progressions/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(progressionController, 'get').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/progressions/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
