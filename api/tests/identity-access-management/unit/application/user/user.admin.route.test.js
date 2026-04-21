import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { userAdminController } from '../../../../../src/identity-access-management/application/user/user.admin.controller.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';

import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

const routesUnderTest = identityAccessManagementRoutes[0];

const CODE_IDENTITY_PROVIDER_GAR = NON_OIDC_IDENTITY_PROVIDERS.GAR.code;
const CODE_IDENTITY_PROVIDER_POLE_EMPLOI = OidcIdentityProviders.POLE_EMPLOI.code;
const oidcProviderCode = 'genericOidcProviderCode';

describe('Unit | Identity Access Management | Application | Route | User', function () {
  describe('PATCH /api/admin/users/{id}', function () {
    it('verifies user identity and return success update when user role is "SUPER_ADMIN"', async function () {
      // given
      sinon.stub(userAdminController, 'updateUserDetailsByAdmin').returns('ok');
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { id: 12344, attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(userAdminController.updateUserDetailsByAdmin);
    });

    it('verifies user identity and return success update when role is "SUPPORT"', async function () {
      // given
      sinon.stub(userAdminController, 'updateUserDetailsByAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { id: 12344, attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

      // then
      expect(result.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(userAdminController.updateUserDetailsByAdmin);
    });

    it(`returns 403 when user don't have access (CERTIF | METIER)`, async function () {
      // given
      sinon.stub(userAdminController, 'updateUserDetailsByAdmin').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { id: 12344, attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/users/12344', payload);

      // then
      expect(result.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.notCalled(userAdminController.updateUserDetailsByAdmin);
    });
  });

  describe('POST /api/admin/users/{id}/add-pix-authentication-method', function () {
    describe('when user role is "SUPER_ADMIN"', function () {
      it('returns 200', async function () {
        // given
        sinon
          .stub(userAdminController, 'addPixAuthenticationMethod')
          .callsFake((request, h) => h.response({}).code(201));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);
        const payload = { data: { attributes: { email: 'user@rexample.net' } } };

        // when
        const { statusCode } = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/add-pix-authentication-method',
          payload,
        );

        // then
        expect(statusCode).to.equal(201);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userAdminController.addPixAuthenticationMethod);
      });
    });

    describe('when user role is "SUPPORT"', function () {
      it('returns 200', async function () {
        // given
        sinon
          .stub(userAdminController, 'addPixAuthenticationMethod')
          .callsFake((request, h) => h.response({}).code(201));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);
        const payload = { data: { attributes: { email: 'user@rexample.net' } } };

        // when
        const { statusCode } = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/add-pix-authentication-method',
          payload,
        );

        // then
        expect(statusCode).to.equal(201);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userAdminController.addPixAuthenticationMethod);
      });
    });

    describe("when user don't have access (CERTIF | METIER)", function () {
      it('returns 403', async function () {
        // given
        sinon.stub(userAdminController, 'addPixAuthenticationMethod').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);
        const payload = { data: { attributes: { email: 'user@rexample.net' } } };

        // when
        const result = await httpTestServer.request(
          'POST',
          '/api/admin/users/1/add-pix-authentication-method',
          payload,
        );

        // then
        expect(result.statusCode).to.equal(403);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.notCalled(userAdminController.addPixAuthenticationMethod);
      });
    });
  });

  describe('POST /api/admin/users/{userId}/authentication-methods/{authenticationMethodId}', function () {
    [CODE_IDENTITY_PROVIDER_GAR, CODE_IDENTITY_PROVIDER_POLE_EMPLOI, oidcProviderCode].forEach((identityProvider) => {
      it(`returns 204 when user role is "SUPER_ADMIN" and identity provider is "${identityProvider}"`, async function () {
        // given
        sinon
          .stub(userAdminController, 'reassignAuthenticationMethod')
          .callsFake((request, h) => h.response({}).code(204));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);
        const payload = {
          data: {
            attributes: {
              'user-id': 2,
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
        expect(statusCode).to.equal(204);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userAdminController.reassignAuthenticationMethod);
      });

      it(`returns 204 when user role is "SUPPORT" and identity provider is "${identityProvider}"`, async function () {
        // given
        sinon
          .stub(userAdminController, 'reassignAuthenticationMethod')
          .callsFake((request, h) => h.response({}).code(204));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(routesUnderTest);
        const payload = {
          data: {
            attributes: {
              'user-id': 3,
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
        expect(statusCode).to.equal(204);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(userAdminController.reassignAuthenticationMethod);
      });
    });

    it(`returns 403 when user don't have access (CERTIF | METIER)`, async function () {
      // given
      sinon.stub(userAdminController, 'reassignAuthenticationMethod').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);
      const payload = {
        data: {
          attributes: {
            'user-id': 2,
          },
        },
      };

      // when
      const result = await httpTestServer.request('POST', '/api/admin/users/1/authentication-methods/1', payload);

      // then
      expect(result.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.notCalled(userAdminController.reassignAuthenticationMethod);
    });
  });
});
