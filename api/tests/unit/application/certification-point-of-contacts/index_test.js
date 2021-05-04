const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/certification-point-of-contacts');
const certificationPointOfContactController = require('../../../../lib/application/certification-point-of-contacts/certification-point-of-contact-controller');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Unit | Router | certification-point-of-contact-router', function() {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(certificationPointOfContactController, 'get').callsFake((request, h) => h.response().code(200));
    sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').returns('ok');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET /api/certification-point-of-contacts/{userId}', () => {

    it('should exist', async () => {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-point-of-contacts/123');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should call pre-handler', async () => {
      // when
      await httpTestServer.request('GET', '/api/certification-point-of-contacts/123');

      // then
      sinon.assert.called(securityPreHandlers.checkRequestedUserIsAuthenticatedUser);
    });
  });
});
