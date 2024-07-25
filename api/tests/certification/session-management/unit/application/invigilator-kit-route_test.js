import { invigilatorKitController } from '../../../../../src/certification/session-management/application/invigilator-kit-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/invigilator-kit-route.js';
import { authorization } from '../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | invigilator-kit-route', function () {
  describe('GET /api/sessions/{id}/supervisor-kit', function () {
    it('should return 200', async function () {
      // when
      sinon.stub(authorization, 'verifySessionAuthorization').resolves(true);
      sinon.stub(invigilatorKitController, 'getInvigilatorKitPdf').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const auth = { credentials: { userId: 99 }, strategy: {} };

      const response = await httpTestServer.request('GET', '/api/sessions/3/supervisor-kit', {}, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 404 if the user is not authorized on the session', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());

      const auth = { credentials: { userId: 99 }, strategy: {} };
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', '/api/sessions/3/supervisor-kit', {}, auth);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
