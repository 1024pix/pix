import lodash from 'lodash';

import { Membership } from '../../../../../lib/domain/models/Membership.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertOrganizationUserWithRoleAdmin,
} from '../../../../../tests/test-helper.js';

const { omit: _omit } = lodash;

describe('Acceptance | Team | Application | Controller | organization-invitation', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/organization-invitations/{id}', function () {
    let organizationId;
    let options;

    context('Success cases', function () {
      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;

        const code = 'ABCDEFGH01';

        const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.PENDING,
          code,
        }).id;

        options = {
          method: 'GET',
          url: `/api/organization-invitations/${organizationInvitationId}?code=${code}`,
        };

        await databaseBuilder.commit();
      });

      it('returns 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('Error cases', function () {
      let organizationInvitationId;

      beforeEach(async function () {
        const code = 'ABCDEFGH01';

        organizationId = databaseBuilder.factory.buildOrganization().id;
        organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          code,
        }).id;

        options = {
          method: 'GET',
          url: `/api/organization-invitations/${organizationInvitationId}?code=${code}`,
        };

        await databaseBuilder.commit();
      });

      it('responds with a 400 - missing parameters if organization-invitation is requested without code', async function () {
        // given
        options.url = `/api/organization-invitations/${organizationInvitationId}`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('responds with a 404 if organization-invitation is not found with given id and code', async function () {
        // given
        options.url = `/api/organization-invitations/${organizationInvitationId}?code=999`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('responds with a 412 if organization-invitation is already accepted', async function () {
        // given
        const code = 'ABCDEFGH01';
        organizationId = databaseBuilder.factory.buildOrganization().id;
        organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          code,
          status: 'accepted',
        }).id;
        await databaseBuilder.commit();

        options.url = `/api/organization-invitations/${organizationInvitationId}?code=${code}`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
  });

  describe('GET /api/organizations/{id}/invitations', function () {
    let organizationId;
    let options;
    let firstOrganizationInvitation;
    let secondOrganizationInvitation;

    beforeEach(async function () {
      const adminUserId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.buildMembership({
        userId: adminUserId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      firstOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      secondOrganizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        status: OrganizationInvitation.StatusType.ACCEPTED,
      });

      options = {
        method: 'GET',
        url: `/api/organizations/${organizationId}/invitations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
      };

      await databaseBuilder.commit();
    });

    context('Expected output', function () {
      it('returns the matching organization-invitations as JSON API', async function () {
        // given
        const expectedResult = {
          data: [
            {
              type: 'organization-invitations',
              attributes: {
                'organization-id': organizationId,
                email: firstOrganizationInvitation.email,
                status: OrganizationInvitation.StatusType.PENDING,
                'updated-at': firstOrganizationInvitation.updatedAt,
                role: firstOrganizationInvitation.role,
              },
            },
            {
              type: 'organization-invitations',
              attributes: {
                'organization-id': organizationId,
                email: secondOrganizationInvitation.email,
                status: OrganizationInvitation.StatusType.PENDING,
                'updated-at': secondOrganizationInvitation.updatedAt,
                role: secondOrganizationInvitation.role,
              },
            },
          ],
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const omittedResult = _omit(
          response.result,
          'data[0].id',
          'data[0].attributes.organization-name',
          'data[1].id',
          'data[1].attributes.organization-name',
        );
        expect(omittedResult.data).to.deep.have.members(expectedResult.data);
      });
    });

    context('Resource access management', function () {
      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if user is not ADMIN in organization', async function () {
        // given
        const nonSuperAdminUserId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonSuperAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('DELETE /api/organizations/{id}/invitations/{invitationId}', function () {
    it('returns 204 HTTP status code', async function () {
      // given
      const server = await createServer();

      const { adminUser, organization } = await insertOrganizationUserWithRoleAdmin();
      const invitation = databaseBuilder.factory.buildOrganizationInvitation({
        organizationId: organization.id,
        status: OrganizationInvitation.StatusType.PENDING,
      });

      const options = {
        method: 'DELETE',
        url: `/api/organizations/${organization.id}/invitations/${invitation.id}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUser.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
