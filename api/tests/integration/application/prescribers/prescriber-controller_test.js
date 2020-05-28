const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const usecases = require('../../../../lib/domain/usecases');

const moduleUnderTest = require('../../../../lib/application/prescribers');

describe('Integration | Application | Prescribers | prescriber-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');
    sandbox.stub(usecases, 'getPrescriber');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    const method = 'GET';
    const url = '/api/prescription/prescribers/1234';
    const auth = { credentials: {}, strategy: {} };

    context('Success cases', () => {

      beforeEach(() => {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.returns(true);
        auth.credentials.userId = '1234';
      });

      it('should return an HTTP response with status code 200', async () => {
        // given
        const prescriber = domainBuilder.buildPrescriber();
        usecases.getPrescriber.resolves(prescriber);

        // when
        const response = await httpTestServer.request(method, url, null, auth);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', () => {

      beforeEach(() => {
        securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });
      });

      it('should return a 403 HTTP response', async () => {
        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

});
