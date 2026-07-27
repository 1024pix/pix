import { learnerManagementSecurityPreHandlers } from '../../../../../src/prescription/learner-management/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

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
                    learnerManagementSecurityPreHandlers.checkOrganizationLearnerBelongsToOrganization(request, h),
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
