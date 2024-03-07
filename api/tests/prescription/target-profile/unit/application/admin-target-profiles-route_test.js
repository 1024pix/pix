import { targetProfileController } from '../../../../../src/prescription/target-profile/application/admin-target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/admin-target-profile-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Target Profiles | Routes', function () {
  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier');
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
  });

  describe('GET /api/admin/target-profiles/{id}/learning-content-pdf?language={language}', function () {
    let method, httpTestServer;

    beforeEach(function () {
      httpTestServer = new HttpTestServer();
      method = 'GET';
      sinon.stub(targetProfileController, 'getLearningContentAsPdf');
    });

    it('should called controller when acces is granted by pre handler validation', async function () {
      // given
      securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
      targetProfileController.getLearningContentAsPdf.returns('ok');

      await httpTestServer.register(moduleUnderTest);
      // when
      const url = '/api/admin/target-profiles/123/learning-content-pdf?language=en';
      await httpTestServer.request(method, url);

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleSupport,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);
      expect(targetProfileController.getLearningContentAsPdf).to.have.been.calledOnce;
    });

    context('Error cases', function () {
      beforeEach(function () {
        targetProfileController.getLearningContentAsPdf.throws('I should not be called');
      });

      it('should not called controller when acces is denied', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.throws();

        await httpTestServer.register(moduleUnderTest);
        // when
        const url = '/api/admin/target-profiles/123/learning-content-pdf?language=en';
        await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.getLearningContentAsPdf).to.not.have.been.called;
      });

      it("should not call controller's handler and return error code 404 when id is not provided", async function () {
        // given
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
    });
  });

  describe('GET /api/admin/target-profiles/{id}/content-json', function () {
    let method, httpTestServer;

    beforeEach(function () {
      httpTestServer = new HttpTestServer();
      method = 'GET';
      sinon.stub(targetProfileController, 'getContentAsJsonFile');
    });

    it('should called controller when acces is granted by securiry pre handler validation', async function () {
      // given
      securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
      targetProfileController.getContentAsJsonFile.returns('ok');

      await httpTestServer.register(moduleUnderTest);
      // when
      const url = '/api/admin/target-profiles/123/content-json';
      await httpTestServer.request(method, url);

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledWithExactly([
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleSupport,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
      ]);

      expect(targetProfileController.getContentAsJsonFile).to.have.been.calledOnce;
    });

    context('Error cases', function () {
      beforeEach(function () {
        targetProfileController.getContentAsJsonFile.throws('I should not be called');
      });

      it('should not called controller when acces is denied', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf.throws();

        await httpTestServer.register(moduleUnderTest);
        // when
        const url = '/api/admin/target-profiles/123/content-json';
        await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.getContentAsJsonFile).to.not.have.been.called;
      });

      it("should not call controller's handler and return error code 404 when id is not provided", async function () {
        // given
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles//content-json';
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
        expect(targetProfileController.getContentAsJsonFile).to.not.have.been.called;
      });

      it("should not call controller's handler and return error code 400 when id is not valid", async function () {
        // given
        await httpTestServer.register(moduleUnderTest);

        // when
        const url = '/api/admin/target-profiles/coucou/content-json';
        const response = await httpTestServer.request(method, url);

        // then
        const error = response?.result?.errors?.[0];
        expect(response.statusCode).to.equal(400);
        expect(error).to.deep.equal({
          status: '400',
          title: 'Bad Request',
          detail: '"id" must be a number',
        });
        expect(targetProfileController.getContentAsJsonFile).to.not.have.been.called;
      });
    });
  });
});
