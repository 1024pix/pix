import { expect } from 'chai';

import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { PIX_ADMIN } from '../../../../src/shared/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

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
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      });
      expect(response.statusCode).to.equal(403);
    });

    it('returns 200 when user is and admin member with one of the allowed roles', async function () {
      const user = databaseBuilder.factory.buildUser.withRole({ disabledAt: null });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/admin/users',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
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
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        const response = await httpServerTest.requestObject(options);

        expect(response.statusCode).to.equal(200);
      });
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

  describe('#checkOrganizationHasFeature', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'has-feature-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test/organizations/{organizationId}/features/{featureKey}',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: securityPreHandlers.checkOrganizationHasFeature,
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
      const feature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      });
      databaseBuilder.factory.buildOrganizationFeature({
        featureId: feature.id,
        organizationId,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/organizations/${organizationId}/features/${feature.key}`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 403 when organization does not have an organization feature', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/organizations/${organizationId}/features/fakeFeatureKey`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('#checkOrganizationDoesNotHaveFeature', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'has-feature-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test/organizations/{organizationId}',
              handler: (r, h) => h.response().code(200),
              config: {
                auth: false,
                pre: [
                  {
                    method: securityPreHandlers.checkOrganizationDoesNotHaveFeature(
                      ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
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

    it('should return 200 when organization does not have the feature', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/organizations/${organizationId}`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 403 when organization has the feature', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const feature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
      });
      databaseBuilder.factory.buildOrganizationFeature({
        featureId: feature.id,
        organizationId,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test/organizations/${organizationId}`,
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('#checkOrganizationIsNotManagingStudents', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/organizations/{organizationId}/test',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkOrganizationIsNotManagingStudents,
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

    it('returns 200 when organization is not managing students', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ isManagingStudents: false });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/test`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });

    it('returns 403 when organization is managing students', async function () {
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: organizationId } = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/test`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
    });
  });

  describe('#checkRequestedUserIsAuthenticatedUser', function () {
    let httpServerTest;

    beforeEach(async function () {
      httpServerTest = await registerRoute({
        method: 'GET',
        path: '/test_route/{userId}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [
            {
              method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            },
          ],
        },
      });
    });

    it('should return a well formed JSON API error when user in query params is not the same as authenticated', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/test_route/3',
        headers: generateAuthenticatedUserRequestHeaders({ userId: 2 }),
      };

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkUserIsAdminInSCOOrganizationAndManagesStudents', function () {
    let httpServerTest;

    beforeEach(async function () {
      httpServerTest = await registerRoute({
        method: 'GET',
        path: '/test_route/{organizationId}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [
            {
              method: securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents,
            },
          ],
        },
      });
    });

    it('respond 403 when the user is not member of the SCO organization managing students', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('respond 200 when the user is admin in the orga and it is SCO orga managing students', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserIsAdminInSUPOrganizationAndManagesStudents', function () {
    let httpServerTest;

    beforeEach(async function () {
      httpServerTest = await registerRoute({
        method: 'GET',
        path: '/test_route/{organizationId}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [
            {
              method: securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents,
            },
          ],
        },
      });
    });

    it('respond 403 when the user is not member of the SUP organization managing students', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true }).id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('respond 200 when the user is admin in the organization and which id not a SUP organization managing students', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route/${organizationId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserIsAdminOfCertificationCenter', function () {
    let httpServerTest;
    let userId;
    let certificationCenterId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

      await databaseBuilder.commit();

      httpServerTest = await registerRoute({
        method: 'GET',
        path: '/test_route/certification-centers/admin/{certificationCenterId}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [
            {
              method: securityPreHandlers.checkUserIsAdminOfCertificationCenter,
            },
          ],
        },
      });

      options = {
        method: 'GET',
        url: `/test_route/certification-centers/admin/${certificationCenterId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };
    });

    it('returns 200 when user is admin of the certification-center', async function () {
      // given
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId,
        certificationCenterId,
        role: 'ADMIN',
        disabledAt: null,
      });

      await databaseBuilder.commit();

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('returns 403 when user is not admin of the certification-center', async function () {
      // given
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'MEMBER' });

      await databaseBuilder.commit();

      // when
      const response = await httpServerTest.requestObject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});

const jsonApiError403 = {
  errors: [
    {
      code: 403,
      title: 'Forbidden access',
      detail: 'Missing or insufficient permissions.',
    },
  ],
};

async function registerRoute(route) {
  const httpServerTest = new HttpTestServer();
  await httpServerTest.register({
    name: 'security-test',
    register: async function (server) {
      server.route(route);
    },
  });
  httpServerTest.setupAuthentication();
  return httpServerTest;
}
