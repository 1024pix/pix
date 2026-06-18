import sinon from 'sinon';

import { tagAdminController } from '../../../../../src/organizational-entities/application/tag/tag.admin.controller.js';
import { tagAdminRoute as tagAdminRoutes } from '../../../../../src/organizational-entities/application/tag/tag.admin.route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Route | Admin | Tag', function () {
  describe('GET /api/admin/tags', function () {
    it('returns a response with an http status code OK', async function () {
      // given
      const tags = [
        domainBuilder.buildTag({ name: 'TAG1' }),
        domainBuilder.buildTag({ name: 'TAG2' }),
        domainBuilder.buildTag({ name: 'TAG3' }),
      ];

      sinon.stub(tagAdminController, 'findAllTags').returns(tags);
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(tagAdminRoutes);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/tags');

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(tagAdminController.findAllTags);
    });
  });

  describe('POST /api/admin/tags', function () {
    it('returns forbidden access if admin member has CERTIF or SUPPORT or METIER role', async function () {
      // given
      sinon.stub(tagAdminController, 'create').resolves('ok');

      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(tagAdminRoutes);

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
      sinon.assert.notCalled(tagAdminController.create);
    });
  });
});
