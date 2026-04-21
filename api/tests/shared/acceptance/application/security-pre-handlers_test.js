import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/domain/constants.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { server } from '../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Application | SecurityPreHandlers', function () {
  const jsonApiError403 = {
    errors: [
      {
        code: 403,
        title: 'Forbidden access',
        detail: 'Missing or insufficient permissions.',
      },
    ],
  };
  describe('#checkCampaignBelongsToCombinedCourse', function () {
    let campaignId;
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/api/pate-de-campagne/{campaignId}',
        handler: (r, h) => h.response({}).code(200),
        config: {
          auth: false,
          pre: [
            {
              method: securityPreHandlers.checkCampaignBelongsToCombinedCourse,
            },
          ],
        },
      });

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId,
        combinedCourseContents: [
          {
            campaignId,
          },
        ],
      });
      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when campaign belongs to a combined course', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/pate-de-campagne/${campaignId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result.errors[0].code).equal('CAMPAIGN_BELONGS_TO_COMBINED_COURSE');
    });
  });

  describe('#checkAdminMemberHasRoleSuperAdmin', function () {
    it('should return a well formed JSON API error when user is not authorized', async function () {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/cache',
        headers: generateAuthenticatedUserRequestHeaders(),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkRequestedUserIsAuthenticatedUser', function () {
    beforeEach(async function () {
      server.route({
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
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkUserBelongsToScoOrganizationAndManagesStudents', function () {
    let userId;
    let organizationId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'GET',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is in a not sco organization', async function () {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP' }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      options.url = `/api/organizations/${organizationId}/sco-participants`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is in a sco orga that does not manage students', async function () {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      options.url = `/api/organizations/${organizationId}/sco-participants`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when membership is disabled', async function () {
      // given
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });

      options.url = `/api/organizations/${organizationId}/sco-participants`;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkUserIsAdminInOrganization', function () {
    let userId;
    let organizationId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/organizations/${organizationId}/invitations`,
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is not admin in the organization', async function () {
      // given
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is admin in the organization, but membership is disabled', async function () {
      // given
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
        disabledAt: new Date(),
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  // TODO: add a route when server already started (should be integration test) ?
  describe.skip('#checkUserIsAdminInSCOOrganizationAndManagesStudents', function () {
    beforeEach(async function () {
      server.route({
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

      const response = await server.inject(options);

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

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  // TODO: add a route when server already started (should be integration test) ?
  describe.skip('#checkUserIsAdminInSUPOrganizationAndManagesStudents', function () {
    beforeEach(async function () {
      server.route({
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

      const response = await server.inject(options);

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

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#hasAtLeastOneAccessOf', function () {
    let userId;
    let organizationId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/memberships`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      await databaseBuilder.commit();
    });

    it('should return a well formed JSON API error when user is neither in the organization nor SUPERADMIN', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('should return a well formed JSON API error when user is in the orga, but membership is disabled', async function () {
      // given
      databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  // TODO: add a route when server already started (should be integration test) ?
  describe.skip('#checkUserIsAdminOfCertificationCenter', function () {
    let userId;
    let certificationCenterId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

      databaseBuilder.factory.options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/organizations/${certificationCenterId}/invitations`,
      };

      await databaseBuilder.commit();

      server.route({
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
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('returns 403 when user is not admin of the certification-center', async function () {
      // given
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'MEMBER' });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  // TODO: add a route when server already started (should be integration test) ?
  describe.skip('#checkUserIsMemberOfAnOrganization', function () {
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/test_route_user_is_member_of_one_organization',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [
            {
              method: securityPreHandlers.checkUserIsMemberOfAnOrganization,
            },
          ],
        },
      });
    });

    it('respond 403 when the user is mamber of any orgnization', async function () {
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route_user_is_member_of_one_organization`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });

    it('respond 200 when the user is member of at least one orgnization', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization({ type: 'SUP', isManagingStudents: true }).id;
      databaseBuilder.factory.buildMembership({
        userId,
        organizationId,
        organizationRole: Membership.roles.MEMBER,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/test_route_user_is_member_of_one_organization`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });

    it('respond 200 when the user is admin of at least one orgnization', async function () {
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
        url: `/test_route_user_is_member_of_one_organization`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserCanDisableHisOrganizationMembership', function () {
    context('when user cannot disable his organization membership', function () {
      it('returns a well formed JSON API error', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({
          userId,
          organizationId,
          organizationRole: Membership.roles.ADMIN,
        });

        await databaseBuilder.commit();

        const options = {
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
          method: 'POST',
          url: '/api/memberships/me/disable',
          payload: { organizationId },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.result).to.deep.equal(jsonApiError403);
      });
    });
  });

  describe('#makeCheckOrganizationHasFeature', function () {
    it('should return a well formed JSON API error when organization does not have feature enabled', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      });
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      const options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/organizations/${organizationId}/place-statistics`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  // TODO: add a route when server already started (should be integration test) ?
  describe.skip('#checkAuthorizationToAccessCombinedCourse', function () {
    let userId;
    let organizationId;
    let options;

    beforeEach(async function () {
      const code = 'COMBINIX1';
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourse({ code, organizationId });

      server.route({
        method: 'GET',
        path: '/api/test-combined-course',
        handler: (r, h) => h.response({}).code(200),
        config: {
          pre: [
            {
              method: securityPreHandlers.checkAuthorizationToAccessCombinedCourse,
            },
          ],
        },
      });

      options = {
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        method: 'GET',
        url: `/api/test-combined-course?filter[code]=${code}`,
      };

      await databaseBuilder.commit();
    });

    it('should return true if connected user is allowed to access given combined course', async function () {
      // given
      databaseBuilder.factory.buildOrganizationLearner({ organizationId, userId });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return an error if connected user is not allowed to access given combined course', async function () {
      // given
      const importFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.LEARNER_IMPORT);
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: importFeature.id,
      });

      await databaseBuilder.commit();
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  // TODO: add a route when server already started (should be integration test) ?
  describe.skip('#checkParticipationBelongsToCombinedCourse', function () {
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/api/fake-cc/{combinedCourseId}/fake-p/{participationId}',
        handler: (_, h) => h.response({}).code(200),
        config: {
          auth: false,
          pre: [
            {
              method: securityPreHandlers.checkParticipationBelongsToCombinedCourse,
            },
          ],
        },
      });
    });

    it('should return true if participation belongs to combined course', async function () {
      // given
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        combinedCourseId,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/fake-cc/${combinedCourseId}/fake-p/${participationId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return an error if participation does not belong to combined course', async function () {
      // given
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse();
      const { id: participationId } = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/fake-cc/${combinedCourseId}/fake-p/${participationId}`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });
});
