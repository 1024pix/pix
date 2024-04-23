import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-administration-route.js';
import { campaignAdministrationController } from '../../../../../src/prescription/campaign/application/campaign-adminstration-controller.js';
import {
  CampaignCodeFormatError,
  CampaignUniqueCodeError,
  SwapCampaignMismatchOrganizationError,
  UnknownCampaignId,
} from '../../../../../src/prescription/campaign/domain/errors.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

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

  describe('PATCH /api/admin/campaigns/{id}', function () {
    it('should return 204', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      sinon
        .stub(campaignAdministrationController, 'updateCampaignDetails')
        .callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: 'name',
            title: 'title',
            'custom-landing-page-text': null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/invalid');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when name is null', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: null,
            title: null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'custom-landing-page-text': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when name is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: '',
            title: null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'custom-landing-page-text': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when title is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: 'name',
            title: '',
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'custom-landing-page-text': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          type: 'campaigns',
          attributes: {
            name: 'name',
            title: 'title',
            'custom-landing-page-text': null,
            'custom-result-page-text': null,
            'custom-result-page-button-text': null,
            'custom-result-page-button-url': null,
            'multiple-sendings': false,
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/1', payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/admin/campaigns/{campaignId}/update-code', function () {
    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((_, h) => h.response(true));
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = { code: 'CAMPAIGN' };
      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/id/update-code', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 with a missing campaign code', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = { code: '' };
      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/123/update-code', payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 422 when campain id cannot be processed', async function () {
      // given
      sinon.stub(campaignAdministrationController, 'updateCampaignCode').throws(new UnknownCampaignId());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        campaignCode: 'CAMPAIGN',
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/123/update-code', payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return 422 when campaign code cannot be processed', async function () {
      // given
      sinon.stub(campaignAdministrationController, 'updateCampaignCode').throws(new CampaignCodeFormatError());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        campaignCode: 'CAMPAIGN',
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/123/update-code', payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('should return 409 when campaign code already exists', async function () {
      // given
      sinon.stub(campaignAdministrationController, 'updateCampaignCode').throws(new CampaignUniqueCodeError());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        campaignCode: 'CAMPAIGN',
      };

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaigns/123/update-code', payload);

      // then
      expect(response.statusCode).to.equal(409);
    });
  });

  describe('PUT /api/campaigns/{id}/archive', function () {
    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/campaigns/invalid/archive');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('DELETE /api/campaigns/{id}/archive', function () {
    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/campaigns/invalid/archive');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/campaigns/archive-campaigns', function () {
    it('returns 200 when admin member has rights', async function () {
      // given
      sinon.stub(campaignAdministrationController, 'archiveCampaigns').returns(null);
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/admin/campaigns/archive-campaigns', {});

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
    });
  });
});
