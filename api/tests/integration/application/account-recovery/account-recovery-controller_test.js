import { expect, sinon, HttpTestServer } from '../../../test-helper.js';
import { NotFoundError, UserNotFoundError } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as moduleUnderTest from '../../../../lib/application/account-recovery/index.js';

describe('Integration | Application | Account-Recovery | account-recovery-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'getAccountRecoveryDetails');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#checkAccountRecoveryDemand', function () {
    const method = 'GET';
    const url = '/api/account-recovery/FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4';

    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        usecases.getAccountRecoveryDetails.resolves({ id: 1, email: 'email@example.net', firstName: 'Gertrude' });

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', function () {
      it('should respond an HTTP response with status code 404 when TemporaryKey not found', async function () {
        // given
        usecases.getAccountRecoveryDetails.rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async function () {
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
