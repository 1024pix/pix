import {
  expect,
  sinon,
  HttpTestServer,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

import { targetProfileController } from '../../../../../src/prescription/target-profile/application/admin-target-profile-controller.js';
import * as adminModuleUnderTest from '../../../../../src/prescription/target-profile/application/admin-target-profile-route.js';
import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

describe('Integration | Application | admin-target-profile-route', function () {
  describe('GET /api/admin/target-profiles/{id}/content-json', function () {
    const method = 'GET';

    let headers, httpTestServer, targetProfileId, url;

    beforeEach(async function () {
      sinon.stub(targetProfileController, 'getContentAsJsonFile').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(adminModuleUnderTest);
      httpTestServer.setupAuthentication();
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    });

    it('return a 403 status code does not have role superAdmin, Metier or Support', async function () {
      const lambdaUser = databaseBuilder.factory.buildUser.withRole({ role: ROLES.CERTIF }).id;
      url = `/api/admin/target-profiles/${targetProfileId}/content-json`;
      // given
      headers = {
        authorization: generateValidRequestAuthorizationHeader(lambdaUser),
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    // Rule disabled to allow dynamic generated tests.
    // See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [ROLES.METIER, ROLES.SUPER_ADMIN, ROLES.SUPPORT].forEach(function (role) {
      it(`return a 200 status code for role ${role}`, async function () {
        const lambdaUser = databaseBuilder.factory.buildUser.withRole({ role });
        await databaseBuilder.commit();
        url = `/api/admin/target-profiles/${targetProfileId}/content-json`;
        // given
        headers = {
          authorization: generateValidRequestAuthorizationHeader(lambdaUser.id),
        };

        // when
        const response = await httpTestServer.request(method, url, null, null, headers);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
