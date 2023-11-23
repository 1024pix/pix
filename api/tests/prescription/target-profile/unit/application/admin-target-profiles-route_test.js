import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { targetProfileController } from '../../../../../src/prescription/target-profile/application/admin-target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/admin-target-profile-route.js';

describe('Unit | Application | Target Profiles | Routes', function () {
  describe('GET /api/admin/target-profiles/{id}/learning-content-pdf?language={language}', function () {
    let method, httpTestServer;

    beforeEach(function () {
      httpTestServer = new HttpTestServer();
      method = 'GET';
    });

    context('Success cases', function () {
      beforeEach(function () {
        sinon.stub(targetProfileController, 'getLearningContentAsPdf').returns('ok');
      });

      it("should call controller's handler when everything is ok - language fr", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=fr';
        await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.getLearningContentAsPdf).to.have.been.called;
      });

      it("should call controller's handler when everything is ok - language en", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=en';
        await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.getLearningContentAsPdf).to.have.been.called;
      });

      it("should call controller's handler when everything is ok - role Super Admin", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=en';
        await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.getLearningContentAsPdf).to.have.been.called;
      });

      it("should call controller's handler when everything is ok - role Metier", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=en';
        await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.getLearningContentAsPdf).to.have.been.called;
      });

      it("should call controller's handler when everything is ok - role Support", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=en';
        await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.getLearningContentAsPdf).to.have.been.called;
      });
    });

    context('Error cases', function () {
      beforeEach(function () {
        sinon.stub(targetProfileController, 'getLearningContentAsPdf').throws('I should not be called');
      });

      it("should not call controller's handler and return error code 404 when id is not provided", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles//learning-content-pdf?language=en';
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
        expect(targetProfileController.getLearningContentAsPdf).to.not.have.been.called;
      });

      it("should not call controller's handler and return error code 400 when id is not valid", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/coucou/learning-content-pdf?language=en';
        const response = await httpTestServer.request(method, url);

        // then
        const error = response?.result?.errors?.[0];
        expect(response.statusCode).to.equal(400);
        expect(error).to.deep.equal({
          status: '400',
          title: 'Bad Request',
          detail: '"id" must be a number',
        });
        expect(targetProfileController.getLearningContentAsPdf).to.not.have.been.called;
      });

      it("should not call controller's handler and return error code 400 when language is not provided", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf';
        const response = await httpTestServer.request(method, url);

        // then
        const error = response?.result?.errors?.[0];
        expect(response.statusCode).to.equal(400);
        expect(error).to.deep.equal({
          status: '400',
          title: 'Bad Request',
          detail: '"language" is required',
        });
        expect(targetProfileController.getLearningContentAsPdf).to.not.have.been.called;
      });

      it("should not call controller's handler and return error code 400 when language is not in allowed values", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=de';
        const response = await httpTestServer.request(method, url);

        // then
        const error = response?.result?.errors?.[0];
        expect(response.statusCode).to.equal(400);
        expect(error).to.deep.equal({
          status: '400',
          title: 'Bad Request',
          detail: '"language" must be one of [fr, en]',
        });
        expect(targetProfileController.getLearningContentAsPdf).to.not.have.been.called;
      });

      it("should not call controller's handler and return error code 403 when user has not the right role", async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=en';
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
        expect(targetProfileController.getLearningContentAsPdf).to.not.have.been.called;
      });
    });
  });
});
