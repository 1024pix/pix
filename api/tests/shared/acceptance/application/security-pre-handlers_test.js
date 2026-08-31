import { expect } from 'chai';

import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { getServer } from '../../../tooling/server/shared-server.js';
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

  let server;

  beforeEach(async function () {
    server = await getServer();
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
});
