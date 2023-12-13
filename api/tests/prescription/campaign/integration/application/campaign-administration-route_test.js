import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { campaignAdministrationController } from '../../../../../src/prescription/campaign/application/campaign-adminstration-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-administration-route.js';

describe('Integration | Application | Route | campaign administration router', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(campaignAdministrationController, 'save').callsFake((request, h) => h.response('ok').code(201));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/campaigns', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('POST', '/api/campaigns');

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
