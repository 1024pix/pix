import {
  expect,
  sinon,
  HttpTestServer,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

import { campaignResultsController } from '../../../../../src/prescription/campaign/application/campaign-results-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign/application/campaign-results-route.js';

describe('Integration | Application | campaign-results-route', function () {
  describe('GET /api/campaigns/{id}/assessment-results', function () {
    const method = 'GET';

    let headers, httpTestServer, organizationId, campaignId, url;
    beforeEach(async function () {
      sinon.stub(campaignResultsController, 'findAssessmentParticipationResults').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    });

    it('return a 401 status code when trying to call route unauthenticated', async function () {
      url = '/api/campaigns/2/assessment-results';
      // given
      headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('return a 403 status code when trying to call route but user is not member', async function () {
      // given
      url = `/api/campaigns/${campaignId}/assessment-results`;
      const simpleUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      headers = {
        authorization: generateValidRequestAuthorizationHeader(simpleUserId),
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return a 400 status code when trying to call route with illegal organization id', async function () {
      // given
      const wrongUrl = `/api/campaigns/GodZilla/assessment-results`;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId, organizationRole: 'MEMBER' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };

      // when
      const response = await httpTestServer.request(method, wrongUrl, null, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
