import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { Membership } from '../../../lib/domain/models/Membership.js';
import { securityPreHandlers } from '../../../lib/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../lib/domain/constants.js';

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

  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#checkAdminMemberHasRoleSuperAdmin', function () {
    it('should return a well formed JSON API error when user is not authorized', async function () {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/cache',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
    });
  });

  describe('#checkRequestedUserIsAuthenticatedUser', function () {
    it('should return a well formed JSON API error when user in query params is not the same as authenticated', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/1/campaign-participations',
        headers: { authorization: generateValidRequestAuthorizationHeader(2) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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

  describe('#checkUserIsAdminInSCOOrganizationAndManagesStudents', function () {
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/test_route/{id}',
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#checkUserIsAdminInSUPOrganizationAndManagesStudents', function () {
    beforeEach(async function () {
      server.route({
        method: 'GET',
        path: '/test_route/{id}',
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#adminMemberHasAtLeastOneAccessOf', function () {
    let userId;
    let organizationId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/memberships`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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

  describe('#checkUserIsAdminOfCertificationCenter', function () {
    let userId;
    let certificationCenterId;
    let options;

    beforeEach(async function () {
      userId = databaseBuilder.factory.buildUser().id;
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

      databaseBuilder.factory.options = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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

  describe('#checkUserIsMemberOfAnOrganization', function () {
    it('should return a well formed JSON API error when user is not authorized', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/frameworks/for-target-profile-submission',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result).to.deep.equal(jsonApiError403);
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
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
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
});
