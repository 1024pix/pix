const {
  expect,
  sinon,
  HttpTestServer,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const stagesController = require('../../../../lib/application/target-profile-management/stages-controller');
const moduleUnderTest = require('../../../../lib/application/target-profile-management');

describe('Integration | Application | Target Profile Management | Routes', function () {
  describe('POST /api/admin/stages', function () {
    const method = 'POST';
    const url = '/api/admin/stages';
    let headers, httpTestServer;
    beforeEach(async function () {
      sinon.stub(stagesController, 'create').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();
    });

    it('should return a 401 status code when trying to call route unauthenticated', async function () {
      // given
      headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should return a 403 status code when trying to call route with a user with no admin role', async function () {
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

    it('should return a 403 status code when trying to call route with an admin user with role certif', async function () {
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

    it('should reach handler when trying to call route with an admin user with role super admin', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(stagesController.create).to.have.been.calledOnce;
    });

    it('should reach handler when trying to call route with an admin user with role support', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser.withRole({ role: 'SUPPORT' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(stagesController.create).to.have.been.calledOnce;
    });

    it('should reach handler when trying to call route with an admin user with role metier', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser.withRole({ role: 'METIER' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(stagesController.create).to.have.been.calledOnce;
    });
  });
  describe('PATCH /api/admin/stages/:id', function () {
    const method = 'PATCH';
    const url = '/api/admin/stages/1';
    let headers, httpTestServer;
    beforeEach(async function () {
      sinon.stub(stagesController, 'update').returns('ok');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();
    });

    it('should return a 401 status code when trying to call route unauthenticated', async function () {
      // given
      headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should return a 400 status code when trying to call route with an illegal id for resource', async function () {
      // given
      const wrongUrl = '/api/admin/stages/coucou';
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

    it('should return a 403 status code when trying to call route with a user with no admin role', async function () {
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

    it('should return a 403 status code when trying to call route with an admin user with role certif', async function () {
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

    it('should reach handler when trying to call route with an admin user with role super admin', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(stagesController.update).to.have.been.calledOnce;
    });

    it('should reach handler when trying to call route with an admin user with role support', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser.withRole({ role: 'SUPPORT' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(stagesController.update).to.have.been.calledOnce;
    });

    it('should reach handler when trying to call route with an admin user with role metier', async function () {
      // given
      const adminUserId = databaseBuilder.factory.buildUser.withRole({ role: 'METIER' }).id;
      await databaseBuilder.commit();
      headers = {
        authorization: generateValidRequestAuthorizationHeader(adminUserId),
      };

      // when
      await httpTestServer.request(method, url, null, null, headers);

      // then
      expect(stagesController.update).to.have.been.calledOnce;
    });
  });
});
