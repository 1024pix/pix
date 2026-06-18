import sinon from 'sinon';

import { invigilatorKitController } from '../../../../../src/certification/session-management/application/invigilator-kit-controller.js';
import { invigilatorKitRoute as moduleUnderTest } from '../../../../../src/certification/session-management/application/invigilator-kit-route.js';
import { authorization } from '../../../../../src/certification/session-management/application/pre-handlers/authorization.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Session Management | Unit | Application | Routes | Invigilator Kit', function () {
  describe('GET /api/sessions/{sessionId}/invigilator-kit', function () {
    it('should return 200', async function () {
      // when
      sinon.stub(authorization, 'checkUserHaveCertificationCenterMembershipForSession').resolves(true);
      sinon.stub(invigilatorKitController, 'getInvigilatorKitPdf').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const auth = { credentials: { userId: 99 }, strategy: {} };

      const response = await httpTestServer.request('GET', '/api/sessions/3/invigilator-kit', {}, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('when user is neither a member on certification center nor a invigilator for the session', function () {
      it('should return an error', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        const auth = { credentials: { userId: 99 }, strategy: {} };
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const response = await httpTestServer.request('GET', '/api/sessions/3/invigilator-kit', {}, auth);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
