import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { config as settings } from '../../../../src/shared/config.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  HttpTestServer,
  sinon,
} from '../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Integration | Application | SecurityPreHandlers', function () {
  describe('check admin member roles for pix admin routes', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/admin/users',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: (request, h) =>
                      securityPreHandlers.hasAtLeastOneAccessOf([
                        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                        securityPreHandlers.checkAdminMemberHasRoleCertif,
                      ])(request, h),
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('returns 403 when user is not an admin member', async function () {
      const user = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await httpServerTest.requestObject(options);
      expect(response.statusCode).to.equal(403);
    });

    it('returns 403 when user is and admin member without one of the allowed roles', async function () {
      const user = databaseBuilder.factory.buildUser.withRole({ disabledAt: null, role: ROLES.METIER });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await httpServerTest.requestObject(options);
      expect(response.statusCode).to.equal(403);
    });

    it('returns 403 when user is and admin member with one of the allowed roles but is disabled', async function () {
      const user = databaseBuilder.factory.buildUser.withRole({ disabledAt: new Date() });

      await databaseBuilder.commit();

      const response = await httpServerTest.requestObject({
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });
      expect(response.statusCode).to.equal(403);
    });

    it('returns 200 when user is and admin member with one of the allowed roles', async function () {
      const user = databaseBuilder.factory.buildUser.withRole({ disabledAt: null });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/users',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      const response = await httpServerTest.requestObject(options);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserBelongsToOrganization', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/check/{organizationId}',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkUserBelongsToOrganization,
                  },
                ],
              },
            },
            {
              method: 'GET',
              path: '/checkwithId/{id}',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkUserBelongsToOrganization,
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('returns 403 when user is not in the organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/check/${organizationId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
    });

    context('returns 200 when the user belongs to the organization', function () {
      it('given id on params', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/checkwithId/${organizationId}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        const response = await httpServerTest.requestObject(options);

        expect(response.statusCode).to.equal(200);
      });

      it('given  organizationId on params', async function () {
        const { id: userId } = databaseBuilder.factory.buildUser();
        const { id: organizationId } = databaseBuilder.factory.buildOrganization();
        databaseBuilder.factory.buildMembership({ userId, organizationId });
        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/check/${organizationId}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        const response = await httpServerTest.requestObject(options);

        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('#checkUserIsMemberOfAnOrganization', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/framework/tubes',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkUserIsMemberOfAnOrganization,
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('returns 403 when user is not a member of an organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/framework/tubes',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
    });

    it('returns 200 when the user is a member of an organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/framework/tubes',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkCertificationCenterIsNotScoManagingStudents', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/framework/{certificationCenterId}',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkCertificationCenterIsNotScoManagingStudents,
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('returns ok when the certification center has no organization', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/framework/${certificationCenterId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });

    context('when the certification center is linked to an organization', function () {
      context('when organization is sco not managing students', function () {
        it('returns 200', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter({
            type: 'SCO',
            externalId: 'XXX',
          });
          databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'XXX', isManagingStudents: false });

          await databaseBuilder.commit();

          const options = {
            method: 'GET',
            url: `/framework/${certificationCenterId}`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          const response = await httpServerTest.requestObject(options);

          expect(response.statusCode).to.equal(200);
        });
      });

      context('when organization is sco managing students', function () {
        it('returns 403', async function () {
          const { id: userId } = databaseBuilder.factory.buildUser();
          const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter({
            type: 'SCO',
            externalId: 'XXX',
          });
          databaseBuilder.factory.buildOrganization({ type: 'SCO', externalId: 'XXX', isManagingStudents: true });

          await databaseBuilder.commit();

          const options = {
            method: 'GET',
            url: `/framework/${certificationCenterId}`,
            headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          };

          const response = await httpServerTest.requestObject(options);

          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#checkIfUserIsBlocked', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'POST',
              path: '/api/token',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: (request, h) => securityPreHandlers.checkIfUserIsBlocked(request, h),
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    describe('when user is not blocked', function () {
      it('returns 200', async function () {
        // given
        databaseBuilder.factory.buildUser({ username: 'lucy123' });
        await databaseBuilder.commit();

        // when
        const response = await httpServerTest.requestObject({
          method: 'POST',
          url: '/api/token',
          payload: {
            username: 'lucy123',
            grant_type: 'password',
          },
        });

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('when user is temporary blocked', function () {
      it('returns 403 with specific code', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ username: 'natsu123' }).id;
        await databaseBuilder.factory.buildUserLogin({
          userId,
          temporaryBlockedUntil: new Date(Date.now() + 3600 * 1000),
        });
        await databaseBuilder.commit();

        // when
        const response = await httpServerTest.requestObject({
          method: 'POST',
          url: '/api/token',
          payload: {
            username: 'natsu123',
            grant_type: 'password',
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].code).to.equal('USER_IS_TEMPORARY_BLOCKED');
      });
    });

    describe('when the application tries to refresh the access token', function () {
      before(async function () {
        // given
        databaseBuilder.factory.buildUser({ username: 'refresh_token_user_1' });
        await databaseBuilder.commit();
      });

      it('returns 200', async function () {
        // when
        const { statusCode } = await httpServerTest.requestObject({
          method: 'POST',
          url: '/api/token',
          payload: { grant_type: 'refresh_token' },
        });

        // then
        expect(statusCode).to.equal(200);
      });
    });

    describe('when user is blocked', function () {
      it('returns 403', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser({ username: 'natsu123' }).id;
        await databaseBuilder.factory.buildUserLogin({
          userId,
          blockedAt: new Date(),
        });
        await databaseBuilder.commit();

        // when
        const response = await httpServerTest.requestObject({
          method: 'POST',
          url: '/api/token',
          payload: { username: 'natsu123', grant_type: 'password' },
        });

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result.errors[0].code).to.equal('USER_IS_BLOCKED');
      });
    });
  });

  describe('#checkPix1dActivated', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test-pix1d',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: (request, h) => securityPreHandlers.checkPix1dActivated(request, h),
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('should authorize access to resource when Pix1D is activated', async function () {
      // given
      sinon.stub(settings.featureToggles, 'isPix1dEnabled').value(true);

      // when
      const options = {
        method: 'GET',
        url: '/api/test-pix1d',
      };

      const { statusCode } = await httpServerTest.requestObject(options);

      // then
      expect(statusCode).to.equal(200);
    });

    it('should forbid resource access when Pix1D is not activated', async function () {
      // given
      sinon.stub(settings.featureToggles, 'isPix1dEnabled').value(false);

      // when
      const options = {
        method: 'GET',
        url: '/api/test-pix1d',
      };

      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('#makeCheckOrganizationHasFeature', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'has-feature-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test/organizations/{organizationId}/has-feature',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: securityPreHandlers.makeCheckOrganizationHasFeature(
                      ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
                    ),
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('should return 200 when organization has the feature', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const featureId = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      }).id;
      databaseBuilder.factory.buildOrganizationFeature({
        featureId,
        organizationId,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/organizations/${organizationId}/has-feature`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 403 when organization has not an organization feature', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/organizations/${organizationId}/has-feature`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('#checkSchoolSessionIsActive', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'has-feature-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test/schools/code',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: securityPreHandlers.checkSchoolSessionIsActive,
                  },
                ],
              },
            },
          ]);
        },
      };
      httpServerTest = new HttpTestServer();
      await httpServerTest.register(moduleUnderTest);
      httpServerTest.setupAuthentication();
    });

    it('should return 200 when school session is active', async function () {
      const sessionExpirationDate = new Date();
      sessionExpirationDate.setHours(sessionExpirationDate.getHours() + 4);

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
      const school = databaseBuilder.factory.buildSchool({
        organizationId: organization.id,
        code: 'SCHOOL',
        sessionExpirationDate,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/schools/code?code=${school.code}`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 404 when school session is not active', async function () {
      const sessionExpirationDate = new Date();
      sessionExpirationDate.setHours(sessionExpirationDate.getHours() - 4);

      const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO-1D' });
      const school = databaseBuilder.factory.buildSchool({
        organizationId: organization.id,
        code: 'SCHOOL',
        sessionExpirationDate,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/schools/code?code=${school.code}`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
