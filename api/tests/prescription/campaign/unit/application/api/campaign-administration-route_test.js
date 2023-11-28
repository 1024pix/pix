import { expect, HttpTestServer, sinon } from '../../../../../test-helper.js';
import { campaignAdministrationController } from '../../../../../../src/prescription/campaign/application/campaign-adminstration-controller.js';
import * as moduleUnderTest from '../../../../../../src/prescription/campaign/application/campaign-administration-route.js';

describe('Unit | Application | Router | campaign-router ', function () {
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
});
