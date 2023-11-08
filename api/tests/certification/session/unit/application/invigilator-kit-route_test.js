import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import * as moduleUnderTest from '../../../../../src/certification/session/application/invigilator-kit-route.js';
import { invigilatorKitController } from '../../../../../src/certification/session/application/invigilator-kit-controller.js';

describe('Unit | Router | invigilator-kit-route', function () {
  describe('GET /api/sessions/{id}/supervisor-kit', function () {
    it('should return 200', async function () {
      // when
      sinon.stub(invigilatorKitController, 'getInvigilatorKitPdf').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', '/api/sessions/3/supervisor-kit');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
