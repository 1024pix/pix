import { finalizeController } from '../../../../../src/certification/session-management/application/finalize-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/finalize-route.js';
import { authorization } from '../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Routes | Finalize', function () {
  describe('PUT /api/sessions/{id}/finalization', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        condition: 'session ID params is not a number',
        request: { method: 'PUT', url: '/api/sessions/salut/finalization' },
      },
      {
        condition: 'session ID params is out of range for database integer (> 2147483647)',
        request: { method: 'PUT', url: '/api/sessions/9999999999/finalization' },
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

    it('should respond OK', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(finalizeController, 'finalize').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          attributes: {
            'examiner-global-comment': 'a comment',
            'has-incident': false,
            'has-joining-issue': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PUT', '/api/sessions/3/finalization', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
