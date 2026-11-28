import { expect } from 'chai';
import sinon from 'sinon';

import { organizationCreditsLotController } from '../../../../../src/organizational-entities/application/credits/organization-credits-lot.controller.js';
import { organizationCreditsLotRoute as moduleUnderTest } from '../../../../../src/organizational-entities/application/credits/organization-credits-lot.route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Organizational Entities | Application | Route | Credits | Organization credits lots', function () {
  describe('GET /api/organizations/{id}/credits-lots', function () {
    it('returns 403 when the organization does not have the credits management feature', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'makeCheckOrganizationHasFeature')
        .returns((request, h) => h.response().code(403).takeover());
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(organizationCreditsLotController, 'getOrganizationCreditsLots').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/1/credits-lots');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(organizationCreditsLotController.getOrganizationCreditsLots);
    });

    it('returns 403 when the user is not a member of the organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'makeCheckOrganizationHasFeature').returns((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(organizationCreditsLotController, 'getOrganizationCreditsLots').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/1/credits-lots');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(organizationCreditsLotController.getOrganizationCreditsLots);
    });

    it('returns 400 when the organization id is invalid', async function () {
      // given
      sinon.stub(securityPreHandlers, 'makeCheckOrganizationHasFeature').returns((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/invalid/credits-lots');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
