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

    it('should update user when payload is valid', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const url = '/api/admin/users/123';

      const payload = {
        data: {
          id: '123',
          attributes: {
            'first-name': 'firstNameUpdated',
            'last-name': 'lastNameUpdated',
            email: 'emailUpdated@example.net',
          },
        },
      };

      // when
      const response = await httpTestServer.request('PATCH', url, payload);

      // then
      expect(response.statusCode).to.equal(200);
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
});
