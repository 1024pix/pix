const { domainBuilder, expect, sinon, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/tags');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const tagController = require('../../../../lib/application/tags/tag-controller');

describe('Unit | Application | Router | tag-router', function () {
  describe('GET /api/admin/tags', function () {
    it('return a response with an http status code OK', async function () {
      // given
      const tags = [
        domainBuilder.buildTag({ name: 'TAG1' }),
        domainBuilder.buildTag({ name: 'TAG2' }),
        domainBuilder.buildTag({ name: 'TAG3' }),
      ];

      sinon.stub(tagController, 'findAllTags').returns(tags);
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').resolves(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/tags');

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(tagController.findAllTags);
    });
  });

  describe('POST /api/admin/tags', function () {
    it('return forbiden access if user has CERTIF or SUPPORT or METIER role', async function () {
      // given
      sinon.stub(tagController, 'create').resolves('ok');

      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(securityPreHandlers, 'checkUserHasRoleCertif').resolves(true);
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSupport').resolves(true);
      sinon.stub(securityPreHandlers, 'checkUserHasRoleMetier').resolves(true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/tags', {
        data: {
          type: 'tags',
          attributes: {
            name: 'Super Tag',
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(tagController.create);
    });
  });
});
