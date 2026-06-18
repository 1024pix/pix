import { moduleMetadataRoute as moduleUnderTest } from '../../../../../src/devcomp/application/modules-metadata/module-metadata-route.js';
import { PIX_ADMIN } from '../../../../../src/shared/domain/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Integration | Devcomp | Application | Route | ModulesMetadata', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    httpTestServer.setupAuthentication();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/admin/modules-metadata', function () {
    context('when user does not have superadmin or metier role', function () {
      it('returns 403 HTTP status code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.CERTIF });
        //  when
        const response = await httpTestServer.request(
          'GET',
          '/api/admin/modules-metadata',
          null,
          null,
          generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        );

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
