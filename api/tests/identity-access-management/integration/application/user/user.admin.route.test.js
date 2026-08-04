import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { userAdminController } from '../../../../../src/identity-access-management/application/user/user.admin.controller.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { QUERY_TYPES } from '../../../../../src/identity-access-management/domain/constants/user-query.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

const CODE_IDENTITY_PROVIDER_GAR = NON_OIDC_IDENTITY_PROVIDERS.GAR.code;
const CODE_IDENTITY_PROVIDER_POLE_EMPLOI = OidcIdentityProviders.POLE_EMPLOI.code;

const oidcProviderCode = 'genericOidcProviderCode';
const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | Admin | User', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
  });

  describe('GET /api/admin/users', function () {
    it('returns an HTTP status code 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(userAdminController, 'findPaginatedFilteredUsers').returns('ok');

      // when
      const response = await httpTestServer.request(
        'GET',
        `/api/admin/users?filter[firstName]=Bruce&filter[lastName]=Wayne&filter[email]=batman@gotham.city&page[number]=3&page[size]=25&queryType=${QUERY_TYPES.CONTAINS}`,
      );

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
      sinon.assert.calledOnce(userAdminController.findPaginatedFilteredUsers);
    });

    it('returns an HTTP status code 403', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) =>
        h
          .response({ errors: new Error('') })
          .code(403)
          .takeover(),
      );

      // when
      const response = await httpTestServer.request(
        'GET',
        `/api/admin/users?filter[firstName]=Bruce&filter[lastName]=Wayne&filter[email]=batman@gotham.city&page[number]=3&page[size]=25&queryType=${QUERY_TYPES.CONTAINS}`,
      );

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
    });

    describe('when the search value in the search email field in users filter is a string and not a full email', function () {
      it('is accepted and the search is performed', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(userAdminController, 'findPaginatedFilteredUsers').returns('ok');

        // when
        const response = await httpTestServer.request('GET', '/api/admin/users?filter[email]=some-value');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('when the id provided in users filter is not numeric', function () {
      it('returns a BadRequest error (400)', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/admin/users?filter[id]=mmmm');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('PATCH /api/admin/users/{id}', function () {
    beforeEach(function () {
      sinon.stub(userAdminController, 'updateUserDetailsByAdmin').returns('updated');
    });

    context('invalid payload', function () {
      context('when a required property is missing', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

          const userId = databaseBuilder.factory.buildUser.anonymous().id;
          await databaseBuilder.commit();

          const payload = {
            data: {
              id: userId,
              type: 'users',
              attributes: {
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: true,
              },
            },
          };

          const url = `/api/admin/users/${userId}`;

          // when
          const response = await httpTestServer.request('PATCH', url, payload);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('"data.attributes.first-name" is required');
        });
      });

      context('when the locale is not supported', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

          const userId = databaseBuilder.factory.buildUser.anonymous().id;
          await databaseBuilder.commit();

          const locale1 = 'fr-fr';
          const locale2 = 'tlh'; // tlh: Klingon locale
          const payload = {
            data: {
              id: userId,
              type: 'users',
              attributes: {
                'first-name': 'Joséphine',
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: true,
              },
            },
          };

          const url = `/api/admin/users/${userId}`;

          // when
          payload.locale = locale1;
          const response1 = await httpTestServer.request('PATCH', url, payload);

          payload.locale = locale2;
          const response2 = await httpTestServer.request('PATCH', url, payload);

          // then
          expect(response1.statusCode).to.equal(400);
          expect(response1.result.errors[0].detail).to.equal('"locale" is not allowed');
          expect(response2.statusCode).to.equal(400);
          expect(response2.result.errors[0].detail).to.equal('"locale" is not allowed');
        });
      });

      context('when a property has not the valid format', function () {
        it('returns an HTTP status code 400', async function () {
          // given
          sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

          const userId = databaseBuilder.factory.buildUser.anonymous().id;
          await databaseBuilder.commit();

          const payload = {
            data: {
              id: userId,
              type: 'users',
              attributes: {
                'first-name': 'Joséphine',
                'last-name': 'Baker',
                email: 'josephine.baker@example.net',
                password: 'someValidPassword-12345678',
                cgu: 'not_a_boolean',
              },
            },
          };

          const url = `/api/admin/users/${userId}`;

          // when
          const response = await httpTestServer.request('PATCH', url, payload);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal('"data.attributes.cgu" must be a boolean');
        });
      });
    });
  });

  describe('POST /api/admin/users/{id}/anonymize', function () {
    it('returns 200 when user role is "SUPER_ADMIN"', async function () {
      // given
      sinon.stub(userAdminController, 'anonymizeUser').callsFake((request, h) => h.response({}).code(200));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      // when
      const { statusCode } = await httpTestServer.request('POST', '/api/admin/users/1/anonymize');

      // then
      expect(statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(userAdminController.anonymizeUser);
    });

    it('returns 200 when user role is "SUPPORT"', async function () {
      // given
      sinon.stub(userAdminController, 'anonymizeUser').callsFake((request, h) => h.response({}).code(200));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));

      // when
      const { statusCode } = await httpTestServer.request('POST', '/api/admin/users/1/anonymize');

      // then
      expect(statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(userAdminController.anonymizeUser);
    });

    it(`returns 403 when user don't have access (CERTIF | METIER)`, async function () {
      // given
      sinon.stub(userAdminController, 'anonymizeUser').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const payloadAttributes = { 'first-name': 'firstname', 'last-name': 'lastname', email: 'partial@update.com' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('POST', '/api/admin/users/1/anonymize', payload);

      // then
      expect(result.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.notCalled(userAdminController.anonymizeUser);
    });
  });

  describe('POST /api/admin/users/{id}/remove-authentication', function () {
    [CODE_IDENTITY_PROVIDER_GAR, 'EMAIL', 'USERNAME', CODE_IDENTITY_PROVIDER_POLE_EMPLOI, oidcProviderCode].forEach(
      (type) => {
        it(`returns 200 when user is "SUPER_ADMIN" and type is ${type}`, async function () {
          // given
          sinon.stub(userAdminController, 'removeAuthenticationMethod').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response(true));
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

          // when
          const result = await httpTestServer.request('POST', '/api/admin/users/1/remove-authentication', {
            data: {
              attributes: {
                type,
              },
            },
          });

          // then
          expect(result.statusCode).to.equal(200);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
          sinon.assert.calledOnce(userAdminController.removeAuthenticationMethod);
        });

        it(`returns 200 when user is "SUPPORT" and type is ${type}`, async function () {
          // given
          sinon.stub(userAdminController, 'removeAuthenticationMethod').returns('ok');
          sinon
            .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
            .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
          sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));

          // when
          const result = await httpTestServer.request('POST', '/api/admin/users/1/remove-authentication', {
            data: {
              attributes: {
                type,
              },
            },
          });

          // then
          expect(result.statusCode).to.equal(200);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
          sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
          sinon.assert.calledOnce(userAdminController.removeAuthenticationMethod);
        });
      },
    );

    it(`returns 403 when user don't have access (CERTIF | METIER)`, async function () {
      // given
      sinon.stub(userAdminController, 'removeAuthenticationMethod').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

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
      sinon.assert.notCalled(userAdminController.removeAuthenticationMethod);
      expect(result.statusCode).to.equal(403);
    });
  });
});
