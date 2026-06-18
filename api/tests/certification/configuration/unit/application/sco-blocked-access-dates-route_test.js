import sinon from 'sinon';

import { scoBlockedAccessDatesController } from '../../../../../src/certification/configuration/application/sco-blocked-access-dates-controller.js';
import { scoBlockedAccessDatesRoute as moduleUnderTest } from '../../../../../src/certification/configuration/application/sco-blocked-access-dates-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Configuration | Unit | Application | Router | sco-blocked-access-dates-route', function () {
  describe('PATCH /api/admin/sco-blocked-access-dates', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(scoBlockedAccessDatesController, 'updateScoBlockedAccessDate').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PATCH', '/api/admin/sco-blocked-access-dates/LYCEE', {
          data: { attributes: { value: '2025-11-15' } },
        });

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(scoBlockedAccessDatesController.updateScoBlockedAccessDate);
      });
    });
  });

  describe('GET /api/admin/sco-blocked-access-dates', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(scoBlockedAccessDatesController, 'getScoBlockedAccessDates').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/sco-blocked-access-dates');

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(scoBlockedAccessDatesController.getScoBlockedAccessDates);
      });
    });
  });
});
