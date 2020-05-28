const Hapi = require('@hapi/hapi');

const { expect, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const prescriberController = require('../../../../lib/application/prescribers/prescriber-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/prescribers'));
}

describe('Unit | Router | prescriber-router', () => {

  describe('GET /api/prescription/prescribers/{id}', () => {

    beforeEach(() => {
      sinon.stub(prescriberController, 'get').returns('ok');
      sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser').callsFake((request, h) => h.response(true));
      startServer();
    });

    it('should exist', async () => {
      // given
      const options = { method: 'GET', url: '/api/prescription/prescribers/1' };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

});
