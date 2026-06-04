import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { PIX_ADMIN } from '../../../../src/shared/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../test-helper.js';
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
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
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
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
          };

          const response = await httpServerTest.requestObject(options);

          expect(response.statusCode).to.equal(403);
        });
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

  describe('#checkOrganizationLearnerBelongsToOrganization', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'security-test',
        register: async function (server) {
          server.route([
            {
              method: 'PATCH',
              path: '/api/organizations/{organizationId}/organization-learners/{organizationLearnerId}',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: (request, h) =>
                      securityPreHandlers.checkOrganizationLearnerBelongsToOrganization(request, h),
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

    describe('when organization learner belongs to the organization', function () {
      it('returns 200', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const organization = databaseBuilder.factory.buildOrganization();
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'John',
          lastName: 'Doe',
        });
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await httpServerTest.requestObject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('when organization learner does not belong to the organization', function () {
      it('returns 404', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const targetOrganization = databaseBuilder.factory.buildOrganization();
        const otherOrganization = databaseBuilder.factory.buildOrganization();
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: otherOrganization.id,
          firstName: 'John',
          lastName: 'Doe',
        });
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/organizations/${targetOrganization.id}/organization-learners/${organizationLearner.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await httpServerTest.requestObject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    describe('when organization learner is deleted', function () {
      it('returns 403', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const organization = databaseBuilder.factory.buildOrganization();
        const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          firstName: 'John',
          lastName: 'Doe',
          deletedAt: new Date(),
        });
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organization.id}/organization-learners/${organizationLearner.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await httpServerTest.requestObject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
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

  describe('#checkCombinedCoursesFeatureIsEnabled', function () {
    let httpServerTest;

    beforeEach(async function () {
      const moduleUnderTest = {
        name: 'feature-test',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
              path: '/api/test-route',
              handler: (r, h) => h.response().code(200),
              config: {
                pre: [
                  {
                    method: securityPreHandlers.checkCombinedCoursesFeatureIsEnabled,
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

    it('returns 200 when combined courses feature is enabled', async function () {
      featureToggles.set('areCombinedCoursesEnabled', true);

      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test-route`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(200);
    });

    it('returns error when combined courses feature is disabled', async function () {
      featureToggles.set('areCombinedCoursesEnabled', false);

      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/test-route`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await httpServerTest.requestObject(options);

      expect(response.statusCode).to.equal(422);
      expect(response.payload).to.equal('Combined courses feature is disabled');
    });
  });
});
