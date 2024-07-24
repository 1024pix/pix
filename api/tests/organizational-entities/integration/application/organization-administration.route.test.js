import { organizationAdminController } from '../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { organizationalEntitiesRoutes } from '../../../../src/organizational-entities/application/routes.js';
import { logo3Mb } from '../../../integration/application/organizations-administration/_files/logo-3mb.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  HttpTestServer,
  sinon,
} from '../../../test-helper.js';

describe('Integration | Organizational Entities | Application | Route | Organization Administration', function () {
  describe('PATCH /api/admin/organizations/{:id}', function () {
    const method = 'PATCH';
    const url = '/api/admin/organizations/1234';
    let headers, httpTestServer;

    beforeEach(async function () {
      sinon.stub(organizationAdminController, 'updateOrganizationInformation').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(organizationalEntitiesRoutes);
      httpTestServer.setupAuthentication();
    });

    it('return a 401 status code when trying to call route unauthenticated', async function () {
      // given
      headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('return a 400 status code when trying to call route with an illegal id for resource', async function () {
      // given
      const wrongUrl = '/api/admin/organizations/coucou';
      const simpleUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(simpleUserId),
      };

      // when
      const response = await httpTestServer.request(method, wrongUrl, null, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('return a 403 status code when trying to call route with a user with no admin role', async function () {
      // given
      const simpleUserId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(simpleUserId),
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return a 403 status code when trying to call route with an admin user with role certif', async function () {
      // given
      const certifUserId = databaseBuilder.factory.buildUser.withRole({ role: 'CERTIF' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(certifUserId),
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('reach handler when trying to call route with an admin user with role support', async function () {
      // given
      const supportUserId = databaseBuilder.factory.buildUser.withRole({ role: 'SUPPORT' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(supportUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(organizationAdminController.updateOrganizationInformation).to.have.been.calledOnce;
    });

    it('reach handler when trying to call route with an admin user with role super admin', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(organizationAdminController.updateOrganizationInformation).to.have.been.calledOnce;
    });

    it('reach handler when trying to call route with an admin user with role metier', async function () {
      // given
      const metierUserId = databaseBuilder.factory.buildUser.withRole({ role: 'METIER' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(metierUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(organizationAdminController.updateOrganizationInformation).to.have.been.calledOnce;
    });

    it('returns a 413 payload too large error', async function () {
      // given
      const metierUserId = databaseBuilder.factory.buildUser.withRole({ role: 'METIER' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(metierUserId),
      };

      const payload = {
        data: {
          type: 'organizations',
          attributes: {
            'logo-url': logo3Mb,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(413);
      expect(response.result.errors[0].code).to.equal('PAYLOAD_TOO_LARGE');
      expect(response.result.errors[0].meta.maxSizeInMegaBytes).to.equal('2.5');
    });
  });
});
