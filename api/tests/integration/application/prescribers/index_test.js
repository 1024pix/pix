const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const prescriberController = require('../../../../lib/application/prescribers/prescriber-controller');
const moduleUnderTest = require('../../../../lib/application/prescribers');

describe('Integration | Application | Prescribers | Routes', () => {

  let httpTestServer;
  const method = 'GET';

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster');
    sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');

    sinon.stub(prescriberController, 'get').returns('ok');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/prescription/prescribers/{id}', () => {

    const auth = { credentials: {}, strategy: {} };

    it('should exist', async () => {
      // given
      auth.credentials.userId = '1234';
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => h.response(true));
      const url = '/api/prescription/prescribers/123';

      // when
      const response = await httpTestServer.request(method, url, null, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 when id in param is not a number"', async () => {

      // given
      const url = '/api/prescription/prescribers/NOT_A_NUMBER';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

  });
});
