import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { schoolController } from '../../../../src/school/application/school-controller.js';
import * as moduleUnderTest from '../../../../src/school/application/school-route.js';

describe('Unit | Router | school-router', function () {
  describe('GET /api/pix1d/schools/:code', function () {
    it('should return 200 if the school is found', async function () {
      // given
      sinon.stub(schoolController, 'getSchool').callsFake((request, h) => h.response('ok'));

      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/schools/AZERTY34');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
