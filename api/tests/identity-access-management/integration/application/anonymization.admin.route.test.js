import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import { PIX_ADMIN } from '../../../../src/shared/constants.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | Anonymization', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    httpTestServer.setupAuthentication();
    await httpTestServer.register(routesUnderTest);
  });

  describe('POST /api/admin/anonymize/gar', function () {
    context('when user is not superadmin', function () {
      it('returns 403 HTTP status code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.CERTIF });
        //  when
        const response = await httpTestServer.request(
          'POST',
          '/api/admin/anonymize/gar',
          {
            data: {},
          },
          null,
          generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        );

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when csv file does not have required header', function () {
      it('returns 412 HTTP status code', async function () {
        //given
        const user = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPER_ADMIN });
        await databaseBuilder.commit();
        const input = `
      123
      456
      789
      `;

        const options = {
          method: 'POST',
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          url: '/api/admin/anonymize/gar',
          payload: input,
        };
        // when
        const response = await httpTestServer.requestObject(options);
        // then
        expect(response.statusCode).to.equal(412);
        expect(response.statusMessage).to.equal('Precondition Failed');
      });
    });

    context('when csv file does not have valid user ids', function () {
      it('returns 422 HTTP status code', async function () {
        //given
        const user = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPER_ADMIN });
        await databaseBuilder.commit();
        const input = `User ID;
      toto
      tata
      titi
      `;

        const options = {
          method: 'POST',
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
          url: '/api/admin/anonymize/gar',
          payload: input,
        };
        // when
        const response = await httpTestServer.requestObject(options);
        // then
        expect(response.statusCode).to.equal(412);
        expect(response.statusMessage).to.equal('Precondition Failed');
      });
    });
  });
});
