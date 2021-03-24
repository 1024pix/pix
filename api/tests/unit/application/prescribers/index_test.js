const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const moduleUnderTest = require('../../../../lib/application/prescribers');

const prescriberController = require('../../../../lib/application/prescribers/prescriber-controller');

describe('Unit | Router | prescriber-router', function() {

  let httpTestServer;

  describe('GET /api/prescription/prescribers/{id}', function() {

    beforeEach(function() {
      sinon.stub(prescriberController, 'get').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));

      httpTestServer = new HttpTestServer(moduleUnderTest);
    });

    it('should exist', async function() {
      // when
      const response = await httpTestServer.request('GET', '/api/prescription/prescribers/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
