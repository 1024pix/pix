import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';

import * as moduleUnderTest from '../../../../../src/certification/session/application/session-route.js';
import { sessionController } from '../../../../../src/certification/session/application/session-controller.js';
import { authorization } from '../../../../../lib/application/preHandlers/authorization.js';

describe('Unit | Router | session-route', function () {
  describe('POST /api/certification-centers/{certificationCenterId}/session', function () {
    it('should return CREATED (200) when everything does as expected', async function () {
      // given
      sinon.stub(sessionController, 'createSession').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter')
        .callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      /// when
      const response = await httpTestServer.request('POST', '/api/certification-centers/123/session');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject an invalid certification-centers id', async function () {
      //given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-centers/invalid/session');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 403 if user is not member of the given certification center', async function () {
      //given
      sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').callsFake((request, h) =>
        h
          .response({ errors: new Error('forbidden') })
          .code(403)
          .takeover(),
      );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-centers/123/session');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/sessions/{id}', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { condition: 'session ID params is not a number', request: { method: 'PATCH', url: '/api/sessions/salut' } },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PATCH', url: '/api/sessions/9999999999' },
      },
    ].forEach(({ condition, request }) => {
      it(`should return 400 when ${condition}`, async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(request.method, request.url, request.payload || null);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(sessionController, 'update').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/sessions/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
