import { sessionController } from '../../../../../src/certification/session-management/application/session-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/session-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Route | Session', function () {
  describe('GET /api/admin/sessions', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'findPaginatedFilteredJurySessions').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/sessions/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(sessionController, 'getJurySession').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/sessions/123');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
