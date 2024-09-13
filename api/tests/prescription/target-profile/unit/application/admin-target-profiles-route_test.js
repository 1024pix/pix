import { targetProfileController } from '../../../../../src/prescription/target-profile/application/admin-target-profile-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/target-profile/application/admin-target-profile-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Admin Target Profiles | Routes', function () {
  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier');
  });

  describe('POST /api/admin/target-profiles/{id}/attach-organizations', function () {
    const method = 'POST';
    const url = '/api/admin/target-profiles/3/attach-organizations';
    const payload = { 'organization-ids': [1, 2] };

    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    });
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'attachOrganizations')
          .callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
      });

      context('when id is a string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/attach-organizations',
            payload,
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when organization-ids is not an array', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url, { 'organization-ids': {} });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when organization-ids is an array of string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url, { 'organization-ids': ['azerty'] });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
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
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/target-profiles/{id}/copy-organizations', function () {
    const method = 'POST';
    const url = '/api/admin/target-profiles/3/copy-organizations';
    const payload = { 'target-profile-id': 1 };

    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    });
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'attachOrganizationsFromExistingTargetProfile')
          .callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
        sinon.assert.calledOnce(targetProfileController.attachOrganizationsFromExistingTargetProfile);
      });

      context('when id is a string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/copy-organizations',
            payload,
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when target profile id is a string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url, { 'target-profile-id': 'azerty' });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
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
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}/learning-content-pdf?language={language}', function () {
    let method, httpTestServer;

    beforeEach(function () {
      httpTestServer = new HttpTestServer();
      method = 'GET';
      sinon.stub(targetProfileController, 'getLearningContentAsPdf');
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
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
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
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

  describe('POST /api/admin/organizations/{organizationId}/attach-target-profiles', function () {
    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    });
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        sinon.stub(targetProfileController, 'attachTargetProfiles').returns('ok');
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'attachOrganizationsFromExistingTargetProfile')
          .callsFake((request, h) => h.response('ok').code(204));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': [1, 2],
        };

        // when
        await httpTestServer.request('POST', '/api/admin/organizations/1/attach-target-profiles', payload);

        // then
        sinon.assert.calledOnce(targetProfileController.attachTargetProfiles);
      });

      it('should return a 404 HTTP response when target-profile-ids do not contain only numbers', async function () {
        // given
        sinon.stub(targetProfileController, 'attachTargetProfiles').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': ['a', 2],
        };

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/admin/organizations/1/attach-target-profiles',
          payload,
        );

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.payload).to.have.string("L'id d'un des profils cible ou de l'organisation n'est pas valide");
      });

      it('should return a 404 HTTP response when organization id is not valid', async function () {
        // given
        sinon.stub(targetProfileController, 'attachTargetProfiles').returns('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = {
          'target-profile-ids': [1, 2],
        };

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/admin/organizations/coucou/attach-target-profiles',
          payload,
        );

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.payload).to.have.string("L'id d'un des profils cible ou de l'organisation n'est pas valide");
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon.stub(targetProfileController, 'attachTargetProfiles');
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
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

        const payload = {
          'target-profile-ids': [1, 2],
        };

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/admin/organizations/1/attach-target-profiles',
          payload,
        );

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(targetProfileController.attachTargetProfiles);
      });
    });
  });

  describe('PUT /api/admin/target-profiles/{targerProfileId}/outdate', function () {
    const method = 'PUT';
    const url = '/api/admin/target-profiles/123/outdate';
    const payload = {};

    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    });
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'outdateTargetProfile')
          .callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
      });

      context('when target profile ID is invalid', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, '/api/admin/target-profiles/azerty/outdate');

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
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
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('PUT /api/admin/target-profiles/{targetProfileId}/simplified-access', function () {
    const method = 'PUT';
    const url = '/api/admin/target-profiles/123/simplified-access';
    const payload = {};

    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    });
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'markTargetProfileAsSimplifiedAccess')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when target profile ID is invalid', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/simplified-access',
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
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
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}/organizations', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1/organizations';

    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    });
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when there is no filter nor pagination', function () {
        it('should resolve with an HTTP status code 200', async function () {
          // given
          securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
          sinon
            .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
            .callsFake((request, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url);

          // then
          expect(statusCode).to.equal(200);
        });
      });

      context('when there are filters and pagination', function () {
        it('should resolve with an HTTP status code 200', async function () {
          // given
          securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
          sinon
            .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
            .callsFake((request, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            `${url}?filter[name]=azerty&filter[type]=sco&filter[external-id]=abc&page[size]=10&page[number]=1`,
          );

          // then
          expect(statusCode).to.equal(200);
        });
      });

      context('when id is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/organizations',
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when page size is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, `${url}?page[size]=azerty`);

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when page number is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, `${url}?page[number]=azerty`);

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
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
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/target-profiles/{targetProfileId}/copy', function () {
    beforeEach(function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    });

    describe('When user has role SUPER_ADMIN or METIER or SUPPORT', function () {
      it('Should return a response with 200 status code', async function () {
        // given
        const method = 'POST';
        const url = '/api/admin/target-profiles/123/copy';

        securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);

        sinon.stub(targetProfileController, 'copyTargetProfile').callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        sinon.assert.calledOnce(targetProfileController.copyTargetProfile);
        expect(statusCode).to.equal(200);
      });
    });

    context('when user has role CERTIF', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        const method = 'POST';
        const url = '/api/admin/target-profiles/123/copy';
        securityPreHandlers.hasAtLeastOneAccessOf
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
          );
        sinon.stub(targetProfileController, 'copyTargetProfile').returns('ko');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(targetProfileController.copyTargetProfile).not.to.have.been.called;
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/organizations/{id}/target-profile-summaries', function () {
    it('should allow to controller if user has role SUPER_ADMIN', async function () {
      // given
      sinon.stub(targetProfileController, 'findTargetProfileSummariesForAdmin').returns('ok');
      securityPreHandlers.checkAdminMemberHasRoleSupport.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleMetier.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      sinon.assert.calledOnce(targetProfileController.findTargetProfileSummariesForAdmin);
    });

    it('should allow to controller if user has role SUPPORT', async function () {
      // given
      sinon.stub(targetProfileController, 'findTargetProfileSummariesForAdmin').returns('ok');
      securityPreHandlers.checkAdminMemberHasRoleSupport.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleMetier.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      sinon.assert.calledOnce(targetProfileController.findTargetProfileSummariesForAdmin);
    });

    it('should allow to controller if user has role METIER', async function () {
      // given
      sinon.stub(targetProfileController, 'findTargetProfileSummariesForAdmin').returns('ok');
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleSupport.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleMetier.callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      sinon.assert.calledOnce(targetProfileController.findTargetProfileSummariesForAdmin);
    });

    it('should return 403 without reaching controller if user has not an allowed role', async function () {
      // given
      sinon.stub(targetProfileController, 'findTargetProfileSummariesForAdmin').returns('ok');
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleSupport.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleMetier.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/organizations/1/target-profile-summaries');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(targetProfileController.findTargetProfileSummariesForAdmin);
    });

    it('should return a 400 HTTP response when organization id is not valid', async function () {
      // given
      sinon.stub(targetProfileController, 'findTargetProfileSummariesForAdmin').returns('ok');
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleSupport.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );
      securityPreHandlers.checkAdminMemberHasRoleMetier.callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/organizations/coucou/target-profile-summaries');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
