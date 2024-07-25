import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-administration-route.js';
import { campaignAdministrationController } from '../../../../../src/prescription/campaign/application/campaign-adminstration-controller.js';
import { DeletedCampaignError } from '../../../../../src/prescription/campaign/domain/errors.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { ObjectValidationError } from '../../../../../src/shared/domain/errors.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  HttpTestServer,
  sinon,
} from '../../../../test-helper.js';

describe('Integration | Application | Route | campaign administration router', function () {
  let httpTestServer;

  describe('POST /api/campaigns', function () {
    it('should call campaign administration save controller', async function () {
      // given
      sinon.stub(campaignAdministrationController, 'save').callsFake((request, h) => h.response('ok').code(201));
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/campaigns');

      // then
      expect(response.statusCode).to.equal(201);
      expect(campaignAdministrationController.save).to.have.been.calledOnce;
    });
  });

  describe('POST /api/admin/campaigns/swap-codes', function () {
    it('should return 403 when user has not super admin role', async function () {
      // given
      const simpleUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const headers = {
        authorization: generateValidRequestAuthorizationHeader(simpleUserId),
      };

      const payload = {
        firstCampaignId: 2,
        secondCampaignId: 2,
      };

      // when
      const response = await httpTestServer.request('POST', '/api/admin/campaigns/swap-codes', payload, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/admin/campaigns/{campaignId}/update-code', function () {
    it('should return 403 when user has not super admin role', async function () {
      // given
      const simpleUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const headers = {
        authorization: generateValidRequestAuthorizationHeader(simpleUserId),
      };

      const payload = {
        campaignCode: 'CAMPAIGN',
      };

      // when
      const response = await httpTestServer.request(
        'PATCH',
        '/api/admin/campaigns/123/update-code',
        payload,
        null,
        headers,
      );

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('DELETE /api/organizations/{organizationId}/campaigns', function () {
    it('return a 204 status code in success case', async function () {
      const userId = 1;
      const organizationId = 2;
      const campaignIds = [1];
      sinon.stub(usecases, 'deleteCampaigns');
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));

      // given
      const method = 'DELETE';
      const url = '/api/organizations/2/campaigns';
      const payload = {
        data: [{ type: 'campaigns', id: campaignIds[0] }],
      };
      httpTestServer = new HttpTestServer();
      httpTestServer.setupDeserialization();
      await httpTestServer.register(moduleUnderTest);

      const headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);
      // then
      expect(securityPreHandlers.checkUserBelongsToOrganization).to.have.been.calledOnce;
      expect(usecases.deleteCampaigns).to.have.been.calledWithExactly({ userId, organizationId, campaignIds });
      expect(response.statusCode).to.equal(204);
    });

    it('return a 422 status code if an ObjectValidationError is thrown', async function () {
      sinon.stub(usecases, 'deleteCampaigns');
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      usecases.deleteCampaigns.rejects(new ObjectValidationError());
      // given
      const method = 'DELETE';
      const url = '/api/organizations/2/campaigns';
      const payload = {
        data: [],
      };
      httpTestServer = new HttpTestServer();
      httpTestServer.setupDeserialization();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);
      // then
      expect(response.statusCode).to.equal(422);
    });

    it('return a 412 status code if an DeletedCampaignError is thrown', async function () {
      sinon.stub(usecases, 'deleteCampaigns');
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      usecases.deleteCampaigns.rejects(new DeletedCampaignError());
      // given
      const method = 'DELETE';
      const url = '/api/organizations/2/campaigns';
      const payload = {
        data: [],
      };
      httpTestServer = new HttpTestServer();
      httpTestServer.setupDeserialization();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);
      // then
      expect(response.statusCode).to.equal(412);
    });
  });
});
