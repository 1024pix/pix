import { juryCommentController } from '../../../../../src/certification/session-management/application/jury-comment-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/jury-comment-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Routes | Jury Comment', function () {
  describe('PUT /api/admin/sessions/{id}/comment', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(juryCommentController, 'commentAsJury').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/comment');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('is protected by a prehandler checking the SUPER_ADMIN role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/comment');

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PUT', '/api/admin/sessions/1/comment');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('DELETE /api/admin/sessions/{id}/comment', function () {
    it('should call appropriate use case and ensure user has access to Pix Admin', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(juryCommentController, 'deleteJuryComment').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('DELETE', '/api/admin/sessions/1/comment');

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.be.calledOnce;
      expect(juryCommentController.deleteJuryComment).to.be.calledOnce;
    });

    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/sessions/1/comment');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
