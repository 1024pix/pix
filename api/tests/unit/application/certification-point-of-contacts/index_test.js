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

  beforeEach(function() {
    sinon.stub(certificationPointOfContactController, 'get').callsFake((request, h) => h.response().code(200));
    sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').returns('ok');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('GET /api/certification-point-of-contacts/{userId}', function() {

    it('should exist', async function() {
      // when
      const result = await httpTestServer.request('GET', '/api/certification-point-of-contacts/123');

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should call pre-handler', async function() {
      // when
      await httpTestServer.request('GET', '/api/certification-point-of-contacts/123');

      // then
      sinon.assert.called(securityPreHandlers.checkRequestedUserIsAuthenticatedUser);
    });
  });
});
