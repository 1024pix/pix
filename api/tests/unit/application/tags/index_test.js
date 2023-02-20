import { domainBuilder, expect, sinon, HttpTestServer } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/tags';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import tagController from '../../../../lib/application/tags/tag-controller';

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
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
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
    it('returns forbidden access if admin member has CERTIF or SUPPORT or METIER role', async function () {
      // given
      sinon.stub(tagController, 'create').resolves('ok');

      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

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
