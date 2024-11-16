import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { userAdminController } from '../../../../../src/identity-access-management/application/user/user.admin.controller.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

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
        '/api/admin/users?filter[firstName]=Bruce&filter[lastName]=Wayne&filter[email]=batman@gotham.city&page[number]=3&page[size]=25',
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
        '/api/admin/users?filter[firstName]=Bruce&filter[lastName]=Wayne&filter[email]=batman@gotham.city&page[number]=3&page[size]=25',
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

    it('should return bad request when firstName is missing', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const url = '/api/admin/users/123';

      const payload = {
        data: {
          id: '123',
          attributes: {
            'last-name': 'lastNameUpdated',
            email: 'emailUpdated@example.net',
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      const firstError = response.result.errors[0];
      expect(firstError.detail).to.equal('"data.attributes.first-name" is required');
    });

    it('should return bad request when lastName is missing', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      const url = '/api/admin/users/123';
      const payload = {
        data: {
          id: '123',
          attributes: {
            'first-name': 'firstNameUpdated',
            email: 'emailUpdated',
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      const firstError = response.result.errors[0];
      expect(firstError.detail).to.equal('"data.attributes.last-name" is required');
    });

    it('should return a 400 when id in param is not a number"', async function () {
      // given
      const url = '/api/admin/users/NOT_A_NUMBER';

      // when
      const response = await httpTestServer.request('PATCH', url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/admin/users/{id}', function () {
    it('returns an HTTP status code 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(userAdminController, 'getUserDetails').resolves('ok');

      // when
      const response = await httpTestServer.request('GET', '/api/admin/users/8');

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
      sinon.assert.calledOnce(userAdminController.getUserDetails);
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
      const response = await httpTestServer.request('GET', '/api/admin/users/8');

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
    });

    it('returns BAD_REQUEST (400) when id in param is not a number"', async function () {
      // given
      const url = '/api/admin/users/NOT_A_NUMBER';

      // when
      const response = await httpTestServer.request('GET', url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns BAD_REQUEST (400) when id in params is out of range"', async function () {
      // given
      const url = '/api/admin/users/0';

      // when
      const response = await httpTestServer.request('GET', url);

      // then
      expect(response.statusCode).to.equal(400);
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

    it('returns 400 when id is not a number', async function () {
      // when
      const { statusCode, payload } = await httpTestServer.request('POST', '/api/admin/users/wrongId/anonymize');

      // then
      expect(statusCode).to.equal(400);
      expect(JSON.parse(payload).errors[0].detail).to.equal('"id" must be a number');
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
});
