const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const stagesController = require('../../../../lib/application/stages/stages-controller');
const moduleUnderTest = require('../../../../lib/application/stages');

let httpTestServer;

function startServer() {
  return new HttpTestServer(moduleUnderTest);
}

describe('Unit | Router | stages-router', () => {

  describe('POST /api/admin/stages', () => {

    const method = 'POST';

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').callsFake((request, h) => {
        h.continue({ credentials: { accessToken: 'jwt.access.token' } });
      });
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
      sinon.stub(stagesController, 'create').returns('ok');
      httpTestServer = startServer();
    });

    it('should exist', async () => {
      // given
      const url = '/api/admin/stages';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
