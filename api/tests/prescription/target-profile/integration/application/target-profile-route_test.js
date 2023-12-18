import {
  expect,
  sinon,
  HttpTestServer,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

import { targetProfileController } from '../../../../../src/prescription/target-profile/application/target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/target-profile-route.js';

describe('Integration | Application | target-profile-route', function () {
  describe('GET /organizations/{id}/target-profiles', function () {
    const method = 'GET';

    let headers, httpTestServer, organizationId, url, payload;

    beforeEach(async function () {
      sinon.stub(targetProfileController, 'findTargetProfiles').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();
      organizationId = databaseBuilder.factory.buildOrganization().id;
    });

    it('return a 401 status code when trying to call route unauthenticated', async function () {
      url = '/api/organizations/2/target-profiles';
      // given
      headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('return a 403 status code if authenticated user does not belong to organization', async function () {
      const lambdaUser = databaseBuilder.factory.buildUser().id;
      url = `/api/organizations/${organizationId}/target-profiles`;
      // given
      headers = {
        authorization: generateValidRequestAuthorizationHeader(lambdaUser),
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return a 400 status code when trying to call route with illegal organization id', async function () {
      // given
      const wrongUrl = `/api/organizations/GodZilla/target-profiles`;
      const adminUser = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: adminUser, organizationRole: 'ADMIN' });
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUser),
      };
      payload = {
        listLearners: [123],
      };

      // when
      const response = await httpTestServer.request(method, wrongUrl, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
