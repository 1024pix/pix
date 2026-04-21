import { createServer } from '../../../../../server.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Team | Route | Admin | organization-invitation', function () {
  describe('GET /api/admin/organizations/{id}/invitations', function () {
    context('Expected output', function () {
      it('returns the matching organization-invitations as JSON API', async function () {
        // given
        const server = await createServer();
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.ACCEPTED,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/${organizationId}/invitations`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        });

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Resource access management', function () {
      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        const server = await createServer();
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/${organizationId}/invitations`,
          headers: { authorization: 'invalid.access.token' },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if user is not ADMIN in organization', async function () {
        // given
        const server = await createServer();
        const nonSuperAdminUserId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/organizations/${organizationId}/invitations`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('DELETE /api/admin/organizations/{organizationId}/invitations/{invitationId}', function () {
    it('returns 204 HTTP status code', async function () {
      // given
      const server = await createServer();

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organization = databaseBuilder.factory.buildOrganization();
      const invitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      const options = {
        method: 'DELETE',
        url: `/api/admin/organizations/${organization.id}/invitations/${invitation.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST /api/admin/organizations/{id}/invitations', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const organization = databaseBuilder.factory.buildOrganization();

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            locale: 'fr',
            role: Membership.roles.ADMIN,
          },
        },
      };

      const options = {
        method: 'POST',
        url: `/api/admin/organizations/${organization.id}/invitations`,
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
