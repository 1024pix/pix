import {
  databaseBuilder,
  expect,
  HttpTestServer,
  sinon,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';
import { campaignAdministrationController } from '../../../../../src/prescription/campaign/application/campaign-adminstration-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-administration-route.js';

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
});
