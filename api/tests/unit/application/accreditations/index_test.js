const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const moduleUnderTest = require('../../../../lib/application/accreditations');
const accreditationController = require('../../../../lib/application/accreditations/accreditation-controller');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Unit | Application | Router | accreditations-router', function () {
  describe('GET /api/accreditations', function () {
    it('should return 403 HTTP status code when the user authenticated is not PixMaster', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(accreditationController, 'findAccreditations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/accreditations');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(accreditationController.findAccreditations);
    });
  });
});
