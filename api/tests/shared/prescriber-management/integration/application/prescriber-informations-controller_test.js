import { expect, sinon, domainBuilder, HttpTestServer } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { usecases } from '../../../../../src/shared/prescriber-management/domain/usecases/index.js';
import * as moduleUnderTest from '../../../../../src/shared/prescriber-management/application/prescriber-informations-route.js';

describe('Integration | Controller | prescriber-informations-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');
    sandbox.stub(usecases, 'getPrescriber');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#get', function () {
    const method = 'GET';
    const url = '/api/prescription/prescribers/1234';
    const auth = { credentials: {}, strategy: {} };

    context('Success cases', function () {
      beforeEach(function () {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.returns(true);
        auth.credentials.userId = '1234';
      });

      it('should return an HTTP response with status code 200', async function () {
        // given
        const prescriber = domainBuilder.buildPrescriber();
        usecases.getPrescriber.resolves(prescriber);

        // when
        const response = await httpTestServer.request(method, url, null, auth);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', function () {
      beforeEach(function () {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should return a 403 HTTP response', async function () {
        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
