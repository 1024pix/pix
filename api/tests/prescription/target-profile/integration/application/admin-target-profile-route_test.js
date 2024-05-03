import { targetProfileController } from '../../../../../src/prescription/target-profile/application/admin-target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/admin-target-profile-route.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  HttpTestServer,
  sinon,
} from '../../../../test-helper.js';

describe('Integration | Application | target-profiles-management | Routes ', function () {
  describe('DELETE /api/admin/target-profiles/{targetProfileId}/detach-organizations', function () {
    const getHeaders = (userId) => ({
      authorization: generateValidRequestAuthorizationHeader(userId),
    });
    let httpTestServer;
    let targetProfileId, organizationId;
    let method, url, payload;

    beforeEach(async function () {
      sinon.stub(targetProfileController, 'detachOrganizations').resolves('ok');

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();

      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      method = 'DELETE';
      url = `/api/admin/target-profiles/${targetProfileId}/detach-organizations`;
      payload = {
        data: {
          attributes: {
            'organization-ids': [organizationId],
          },
        },
      };
    });

    it('should return a 401 status code when calling route unauthenticated', async function () {
      // given
      const headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should return a 403 status code when calling route with a user with no admin role', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const response = await httpTestServer.request(method, url, payload, null, getHeaders(userId));

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should reach handler when calling route with an admin user with role super admin', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' }).id;
      await databaseBuilder.commit();

      // when
      await httpTestServer.request(method, url, payload, null, getHeaders(userId));

      // then
      expect(targetProfileController.detachOrganizations).to.have.been.calledOnce;
    });

    it('should reach handler when calling route with an admin user with role metier', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole({ role: 'METIER' }).id;
      await databaseBuilder.commit();

      // when
      await httpTestServer.request(method, url, payload, null, getHeaders(userId));

      // then
      expect(targetProfileController.detachOrganizations).to.have.been.calledOnce;
    });
  });
});
