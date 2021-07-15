const {
  domainBuilder,
  expect,
  sinon,
  HttpTestServer,
} = require('../../../test-helper');
const { featureToggles } = require('../../../../lib/config');
const {
  NotFoundError,
  UserNotFoundError,
} = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');

const moduleUnderTest = require('../../../../lib/application/account-recovery');

describe('Integration | Application | Account-Recovery | account-recovery-controller', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(usecases, 'getUserByAccountRecoveryDemand');

    httpTestServer = new HttpTestServer();
    featureToggles.isScoAccountRecoveryEnabled = true;
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#checkAccountRecoveryDemand', () => {

    const method = 'GET';
    const url = '/api/account-recovery/ABCDEF123';
    const userId = 1234;
    const user = domainBuilder.buildUser({ userId });

    context('Success cases', () => {

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.getUserByAccountRecoveryDemand.resolves(user);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('users');
        expect(response.result.data.id).to.equal(user.id.toString());
      });
    });

    context('Error cases', () => {

      it('should respond an HTTP response with status code 404 when TemporaryKey not found', async () => {
        // given
        usecases.getUserByAccountRecoveryDemand.rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async () => {
        // given
        usecases.getUserByAccountRecoveryDemand.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });

    });
  });

});
