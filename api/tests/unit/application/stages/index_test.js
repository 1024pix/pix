const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const stagesController = require('../../../../lib/application/stages/stages-controller');
const moduleUnderTest = require('../../../../lib/application/stages');

describe('Unit | Application | Stages | Routes', function () {
  describe('GET /api/admin/stages/:id', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(stagesController, 'getStageDetails').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/stages/34';

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(200);
    });

    it('should return a 400 error when the id is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const unknownId = 'abcd45';
      const url = `/api/admin/stages/${unknownId}`;

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(400);
    });
  });
});
