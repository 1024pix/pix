import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { userVerification } from '../../../../lib/application/preHandlers/user-existence-verification.js';
import { userController } from '../../../../lib/application/users/user-controller.js';
import * as OidcIdentityProviders from '../../../../lib/domain/constants/oidc-identity-providers.js';
import * as moduleUnderTest from '../../../../lib/application/users/index.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';

const CODE_IDENTITY_PROVIDER_GAR = NON_OIDC_IDENTITY_PROVIDERS.GAR.code;
const CODE_IDENTITY_PROVIDER_POLE_EMPLOI = OidcIdentityProviders.POLE_EMPLOI.code;
const CODE_IDENTITY_PROVIDER_CNAV = OidcIdentityProviders.CNAV.code;

describe('Unit | Router | user-router', function () {
  describe('POST /api/users', function () {
    const method = 'POST';
    const url = '/api/users';

    context('Payload schema validation', function () {
      it('should return HTTP 400 if payload does not exist', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = null;

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return HTTP 200 if payload is not empty and valid', async function () {
        // given
        sinon.stub(userController, 'save').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/users/me', function () {
    const method = 'GET';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'getCurrentUser').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/me';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/users/{id}/password-update', function () {
    const method = 'PATCH';
    const url = '/api/users/12344/password-update';

    it('should exist and pass through user verification pre-handler', async function () {
      // given
      sinon.stub(userController, 'updatePassword').returns('ok');
      sinon.stub(userVerification, 'verifyById').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payloadAttributes = { password: 'Pix2019!' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request(method, url, payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(userVerification.verifyById);
    });

    describe('Payload schema validation', function () {
      it('should have a payload', async function () {
        // when
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const result = await httpTestServer.request(method, url);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should have a password attribute in payload', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = { data: { attributes: {} } };

        // when
        const result = await httpTestServer.request(method, url, payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      describe('password validation', function () {
        it('should have a valid password format in payload', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const payloadAttributes = {
            password: 'Mot de passe mal formé',
          };
          const payload = { data: { attributes: payloadAttributes } };

          // when
          const result = await httpTestServer.request(method, url, payload);

          // then
          expect(result.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('GET /api/users/{id}/is-certifiable', function () {
    const method = 'GET';
    const url = '/api/users/42/is-certifiable';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'isCertifiable').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.isCertifiable);
    });
  });

  describe('GET /api/users/{id}/profile', function () {
    const method = 'GET';
    const url = '/api/users/42/profile';

    it('should exist', async function () {
      // given
      sinon.stub(userController, 'getProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, url);

      // then
      sinon.assert.calledOnce(userController.getProfile);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/profile', function () {
    const method = 'GET';

    it('should return 200', async function () {
      // given
      sinon.stub(userController, 'getUserProfileSharedForCampaign').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/profile';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/assessment-result', function () {
    const method = 'GET';

    it('should return 200', async function () {
      // given
      sinon.stub(userController, 'getUserCampaignAssessmentResult').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/assessment-result';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/assessment-result`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/assessment-result`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/campaign-participations', function () {
    const method = 'GET';

    it('should return 200', async function () {
      // given
      sinon.stub(userController, 'getUserCampaignParticipationToCampaign').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/campaign-participations';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/campaign-participations`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return 400 when campaignId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/campaign-participations`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('PUT /api/users/{id}/email/verification-code', function () {
    it('should return HTTP code 204', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      sinon.stub(userController, 'sendVerificationCode').callsFake((request, h) => h.response({}).code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';
      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(204);
    });

    it('should return 422 when id is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/wrongId/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"id" must be a number');
    });

    it('should return 422 when type is not users', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'WRONG-TYPE',
          attributes: {
            'new-email': 'user@example.net',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.type" must be [email-verification-codes]');
    });

    it('should return 422 when email is not valid', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'newEmail',
            password: 'Password123',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.attributes.new-email" must be a valid email');
    });

    it('should return 422 when password is not provided', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/email/verification-code';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            'new-email': 'user@example.net',
          },
        },
      };

      // when
      const result = await httpTestServer.request('PUT', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal('"data.attributes.password" is required');
    });
  });

  describe('POST /api/users/{id}/update-email', function () {
    it('should return 403 if requested user is not the same as authenticated user', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/update-email';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code: '999999',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(403);
      expect(result.result.errors[0].detail).to.equal('Missing or insufficient permissions.');
    });

    it('should return 422 when code is not valid', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/update-email';

      const payload = {
        data: {
          type: 'email-verification-codes',
          attributes: {
            code: '9',
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', url, payload);

      // then
      expect(result.statusCode).to.equal(422);
      expect(result.result.errors[0].detail).to.equal(
        '"data.attributes.code" with value "9" fails to match the required pattern: /^[1-9]{6}$/',
      );
    });
  });

  describe('GET /api/users/{id}/authentication-methods', function () {
    const method = 'GET';

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/authentication-methods`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{id}/trainings', function () {
    const method = 'GET';

    it('should return 200', async function () {
      // given
      sinon.stub(userController, 'findPaginatedUserRecommendedTrainings').returns('ok');
      const securityPreHandlersStub = sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/1/trainings';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
      expect(securityPreHandlersStub).to.have.been.called;
    });

    it('should return 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/trainings`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  context('Routes /admin', function () {
    describe('GET /api/admin/users', function () {
      it('should return an HTTP status code 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(userController, 'findPaginatedFilteredUsers').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/admin/users?firstName=Bruce&lastName=Wayne&email=batman@gotham.city&page=3&pageSize=25',
        );

        // then
        sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
        sinon.assert.calledOnce(userController.findPaginatedFilteredUsers);
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP status code 403', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns((request, h) =>
          h
            .response({ errors: new Error('') })
            .code(403)
            .takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/admin/users?firstName=Bruce&lastName=Wayne&email=batman@gotham.city&page=3&pageSize=25',
        );

        // then
        sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
        expect(response.statusCode).to.equal(403);
      });

      describe('when the search value in the search email field in users filter is a string and not a full email', function () {
        it('is accepted and the search is performed', async function () {
          // given
          sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
          sinon.stub(userController, 'findPaginatedFilteredUsers').returns('ok');
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('GET', '/api/admin/users?filter[email]=some-value');

          // then
          expect(response.statusCode).to.equal(200);
        });
      });

      describe('when the id provided in users filter is not numeric', function () {
        it('returns a BadRequest error (400)', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('GET', '/api/admin/users?filter[id]=mmmm');

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });

    describe('GET /api/admin/users/{id}', function () {
      it('should return an HTTP status code 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(userController, 'getUserDetailsForAdmin').resolves('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/users/8');

        // then
        sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
        sinon.assert.calledOnce(userController.getUserDetailsForAdmin);
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP status code 403', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns((request, h) =>
          h
            .response({ errors: new Error('') })
            .code(403)
            .takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/users/8');

        // then
        sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('PATCH /api/admin/users/{id}', function () {
      it('should verify user identity and return success update when user role is "SUPER_ADMIN"', async function () {
        // given
        sinon.stub(userController, 'updateUserDetailsForAdministration').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
        const payload = { data: { attributes: payloadAttributes } };

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userController.updateUserDetailsForAdministration);
        expect(result.statusCode).to.equal(200);
      });

      it('should verify user identity and return success update when role is "SUPPORT"', async function () {
        // given
        sinon.stub(userController, 'updateUserDetailsForAdministration').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
        const payload = { data: { attributes: payloadAttributes } };

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userController.updateUserDetailsForAdministration);
        expect(result.statusCode).to.equal(200);
      });

      it('should return bad request when param id is not numeric', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payload = { data: { attributes: { email: 'partial@update.net' } } };

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/users/not_number', payload);

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return bad request when payload is not found', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/users/12344');

        // then
        expect(result.statusCode).to.equal(400);
      });

      it(`should return 403 when user don't have access (CERTIF | METIER)`, async function () {
        // given
        sinon.stub(userController, 'updateUserDetailsForAdministration').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
        const payload = { data: { attributes: payloadAttributes } };

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.notCalled(userController.updateUserDetailsForAdministration);
        expect(result.statusCode).to.equal(403);
      });
    });

    describe('POST /api/admin/users/{id}/anonymize', function () {
      it('should return 200 when user role is "SUPER_ADMIN"', async function () {
        // given
        sinon.stub(userController, 'anonymizeUser').callsFake((request, h) => h.response({}).code(200));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request('POST', '/api/admin/users/1/anonymize');

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userController.anonymizeUser);
        expect(statusCode).to.equal(200);
      });

      it('should return 200 when user role is "SUPPORT"', async function () {
        // given
        sinon.stub(userController, 'anonymizeUser').callsFake((request, h) => h.response({}).code(200));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request('POST', '/api/admin/users/1/anonymize');

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userController.anonymizeUser);
        expect(statusCode).to.equal(200);
      });

      it('should return 400 when id is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode, payload } = await httpTestServer.request('POST', '/api/admin/users/wrongId/anonymize');

        // then
        expect(statusCode).to.equal(400);
        expect(JSON.parse(payload).errors[0].detail).to.equal('"id" must be a number');
      });

      it(`should return 403 when user don't have access (CERTIF | METIER)`, async function () {
        // given
        sinon.stub(userController, 'anonymizeUser').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
        const payload = { data: { attributes: payloadAttributes } };

        // when
        const result = await httpTestServer.request('POST', '/api/admin/users/1/anonymize', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.notCalled(userController.anonymizeUser);
        expect(result.statusCode).to.equal(403);
      });
    });

    describe('POST /api/admin/users/{id}/add-pix-authentication-method', function () {
      it('should return 200 when user role is "SUPER_ADMIN"', async function () {
        // given
        sinon
          .stub(userController, 'addPixAuthenticationMethodByEmail')
          .callsFake((request, h) => h.response({}).code(201));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = { data: { attributes: { email: 'user@rexample.net' } } };

        // when
        const { statusCode } = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/add-pix-authentication-method',
          payload,
        );

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userController.addPixAuthenticationMethodByEmail);
        expect(statusCode).to.equal(201);
      });

      it('should return 200 when user role is "SUPPORT"', async function () {
        // given
        sinon
          .stub(userController, 'addPixAuthenticationMethodByEmail')
          .callsFake((request, h) => h.response({}).code(201));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = { data: { attributes: { email: 'user@rexample.net' } } };

        // when
        const { statusCode } = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/add-pix-authentication-method',
          payload,
        );

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userController.addPixAuthenticationMethodByEmail);
        expect(statusCode).to.equal(201);
      });

      it('should return 400 when id is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode, payload } = await httpTestServer.request(
          'POST',
          '/api/admin/users/invalid-id/add-pix-authentication-method',
        );

        // then
        expect(statusCode).to.equal(400);
        expect(JSON.parse(payload).errors[0].detail).to.equal('"id" must be a number');
      });

      it(`should return 403 when user don't have access (CERTIF | METIER)`, async function () {
        // given
        sinon.stub(userController, 'addPixAuthenticationMethodByEmail').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = { data: { attributes: { email: 'user@rexample.net' } } };

        // when
        const result = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/add-pix-authentication-method',
          payload,
        );

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.notCalled(userController.addPixAuthenticationMethodByEmail);
        expect(result.statusCode).to.equal(403);
      });
    });

    describe('POST /api/admin/users/{id}/remove-authentication', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        CODE_IDENTITY_PROVIDER_GAR,
        'EMAIL',
        'USERNAME',
        CODE_IDENTITY_PROVIDER_POLE_EMPLOI,
        CODE_IDENTITY_PROVIDER_CNAV,
      ].forEach((type) => {
        it(`should return 200 when user is "SUPER_ADMIN" and type is ${type}`, async function () {
          // given
          sinon.stub(userController, 'removeAuthenticationMethod').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response(true));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const result = await httpTestServer.request('POST', '/api/admin/users/1/remove-authentication', {
            data: {
              attributes: {
                type,
              },
            },
          });

          // then
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
          sinon.assert.calledOnce(userController.removeAuthenticationMethod);
          expect(result.statusCode).to.equal(200);
        });

        it(`should return 200 when user is "SUPPORT" and type is ${type}`, async function () {
          // given
          sinon.stub(userController, 'removeAuthenticationMethod').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const result = await httpTestServer.request('POST', '/api/admin/users/1/remove-authentication', {
            data: {
              attributes: {
                type,
              },
            },
          });

          // then
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
          sinon.assert.calledOnce(userController.removeAuthenticationMethod);
          expect(result.statusCode).to.equal(200);
        });
      });

      it('should return 400 when id is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('POST', '/api/admin/users/invalid-id/remove-authentication', {
          data: {
            attributes: {
              type: 'EMAIL',
            },
          },
        });

        // then
        expect(result.statusCode).to.equal(400);
      });

      it('should return 400 when type is not GAR or EMAIL or USERNAME or POLE_EMPLOI or CNAV', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('POST', '/api/admin/users/1/remove-authentication', {
          data: {
            attributes: {
              type: 'INVALID',
            },
          },
        });

        // then
        expect(result.statusCode).to.equal(400);
      });

      it(`should return 403 when user don't have access (CERTIF | METIER)`, async function () {
        // given
        sinon.stub(userController, 'removeAuthenticationMethod').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const result = await httpTestServer.request('POST', '/api/admin/users/1/remove-authentication', {
          data: {
            attributes: {
              type: OidcIdentityProviders.POLE_EMPLOI.code,
            },
          },
        });

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.notCalled(userController.removeAuthenticationMethod);
        expect(result.statusCode).to.equal(403);
      });
    });

    describe('POST /api/admin/users/{userId}/authentication-methods/{authenticationMethodId}', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [CODE_IDENTITY_PROVIDER_GAR, CODE_IDENTITY_PROVIDER_POLE_EMPLOI, CODE_IDENTITY_PROVIDER_CNAV].forEach(
        (identityProvider) => {
          it(`should return 200 when user role is "SUPER_ADMIN" and identity provider is "${identityProvider}"`, async function () {
            // given
            sinon
              .stub(userController, 'reassignAuthenticationMethods')
              .callsFake((request, h) => h.response({}).code(204));
            sinon
              .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
              .callsFake((request, h) => h.response(true));
            sinon
              .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
              .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
            const httpTestServer = new HttpTestServer();
            await httpTestServer.register(moduleUnderTest);
            const payload = {
              data: {
                attributes: {
                  'user-id': 2,
                  'identity-provider': identityProvider,
                },
              },
            };

            // when
            const { statusCode } = await httpTestServer.request(
              'POST',
              '/api/admin/users/1/authentication-methods/1',
              payload,
            );

            // then
            sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
            sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
            sinon.assert.calledOnce(userController.reassignAuthenticationMethods);
            expect(statusCode).to.equal(204);
          });

          it(`should return 200 when user role is "SUPPORT" and identity provider is "${identityProvider}"`, async function () {
            // given
            sinon
              .stub(userController, 'reassignAuthenticationMethods')
              .callsFake((request, h) => h.response({}).code(204));
            sinon
              .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
              .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
            sinon
              .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
              .callsFake((request, h) => h.response(true));
            const httpTestServer = new HttpTestServer();
            await httpTestServer.register(moduleUnderTest);
            const payload = {
              data: {
                attributes: {
                  'user-id': 3,
                  'identity-provider': identityProvider,
                },
              },
            };

            // when
            const { statusCode } = await httpTestServer.request(
              'POST',
              '/api/admin/users/1/authentication-methods/1',
              payload,
            );

            // then
            sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
            sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
            sinon.assert.calledOnce(userController.reassignAuthenticationMethods);
            expect(statusCode).to.equal(204);
          });
        },
      );

      it('returns 400 when "userId" is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode, payload } = await httpTestServer.request(
          'POST',
          '/api/admin/users/invalid-id/authentication-methods/1',
        );

        // then
        expect(statusCode).to.equal(400);
        expect(JSON.parse(payload).errors[0].detail).to.equal('"userId" must be a number');
      });

      it('returns 400 when "authenticationMethodId" is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode, payload } = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/authentication-methods/invalid-id',
        );

        // then
        expect(statusCode).to.equal(400);
        expect(JSON.parse(payload).errors[0].detail).to.equal('"authenticationMethodId" must be a number');
      });

      it('returns 400 when the payload contains an invalid identity provider', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {
            attributes: {
              'user-id': 1,
              'identity-provider': 'invalid-identity-provider',
            },
          },
        };

        // when
        const { statusCode, result } = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/authentication-methods/1',
          payload,
        );

        // then
        expect(statusCode).to.equal(400);
        expect(result.errors[0].detail).to.equal(
          '"data.attributes.identity-provider" must be one of [GAR, POLE_EMPLOI, CNAV, FWB, PAYSDELALOIRE]',
        );
      });
      it('returns 400 when the payload contains an invalid user id', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {
            attributes: {
              'user-id': 'invalid-user-id',
              'identity-provider': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            },
          },
        };

        // when
        const { statusCode, result } = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/authentication-methods/1',
          payload,
        );

        // then
        expect(statusCode).to.equal(400);
        expect(result.errors[0].detail).to.equal('"data.attributes.user-id" must be a number');
      });

      it(`returns 403 when user don't have access (CERTIF | METIER)`, async function () {
        // given
        sinon.stub(userController, 'reassignAuthenticationMethods').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {
            attributes: {
              'user-id': 2,
              'identity-provider': NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
            },
          },
        };

        // when
        const result = await httpTestServer.request('POST', '/api/admin/users/1/authentication-methods/1', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.notCalled(userController.reassignAuthenticationMethods);
        expect(result.statusCode).to.equal(403);
      });
    });

    describe('GET /api/admin/users/{id}/participations', function () {
      it('should return an HTTP status code 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(userController, 'findCampaignParticipationsForUserManagement').resolves('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/users/8/participations');

        // then
        sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
        sinon.assert.calledOnce(userController.findCampaignParticipationsForUserManagement);
        expect(response.statusCode).to.equal(200);
      });

      it('should return an HTTP status code 403', async function () {
        // given
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns((request, h) =>
          h
            .response({ errors: new Error('') })
            .code(403)
            .takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/users/8/participations');

        // then
        sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
