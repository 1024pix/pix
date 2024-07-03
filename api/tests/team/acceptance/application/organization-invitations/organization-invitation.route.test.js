import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertOrganizationUserWithRoleAdmin,
} from '../../../../../tests/test-helper.js';

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
