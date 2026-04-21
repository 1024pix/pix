import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { NotFoundError, UserNotFoundError } from '../../../../../src/shared/domain/errors.js';

import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | account-recovery', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'getAccountRecoveryDetails');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
  });

  describe('GET /api/account-recovery/', function () {
    const method = 'GET';
    const url = '/api/account-recovery/FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4';

    context('when TemporaryKey not found', function () {
      it('returns an HTTP response with status code 404', async function () {
        // given
        usecases.getAccountRecoveryDetails.rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when UserNotFoundError', function () {
      it('returns an HTTP response with status code 404', async function () {
        // given
        usecases.getAccountRecoveryDetails.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
