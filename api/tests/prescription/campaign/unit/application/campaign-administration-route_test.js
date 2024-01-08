import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { campaignAdministrationController } from '../../../../../src/prescription/campaign/application/campaign-adminstration-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-administration-route.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import {
  SwapCampaignMismatchOrganizationError,
  UnknownCampaignId,
} from '../../../../../src/prescription/campaign/domain/errors.js';

describe('Unit | Application | Router | campaign-administration-router ', function () {
  describe('POST /api/campaigns', function () {
    it('should return 201', async function () {
      // given
      sinon.stub(campaignAdministrationController, 'save').callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/campaigns');

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('PATCH /api/campaigns/{id}', function () {
    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/campaigns/invalid');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/admin/campaigns/swap-codes', function () {
    let swapCampaignCodesStub;

    beforeEach(function () {
      swapCampaignCodesStub = sinon.stub(campaignAdministrationController, 'swapCampaignCodes');
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
    });

    it('should return 400 with an invalid first campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        firstCampaignId: 'toto',
        secondCampaignId: 2,
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/campaigns/swap-codes', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 with an invalid second campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        firstCampaignId: 2,
        secondCampaignId: 'toto',
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/campaigns/swap-codes', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 422 when action cannot be processed', async function () {
      // given
      swapCampaignCodesStub.throws(new UnknownCampaignId());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        firstCampaignId: 2,
        secondCampaignId: 3,
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/campaigns/swap-codes', payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return 403 when action is Forbidden', async function () {
      // given
      swapCampaignCodesStub.throws(new SwapCampaignMismatchOrganizationError());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        firstCampaignId: 2,
        secondCampaignId: 3,
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/campaigns/swap-codes', payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
