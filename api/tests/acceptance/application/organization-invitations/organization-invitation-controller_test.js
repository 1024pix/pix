import { expect, databaseBuilder } from '../../../test-helper.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import { OrganizationInvitation } from '../../../../lib/domain/models/OrganizationInvitation.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | Application | organization-invitation-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/organization-invitations/{id}/response', function () {
    context('Success cases', function () {
      let organizationId;
      let options;

      beforeEach(async function () {
        organizationId = databaseBuilder.factory.buildOrganization().id;
        const adminOrganizationUserId = databaseBuilder.factory.buildUser().id;

        databaseBuilder.factory.buildMembership({
          userId: adminOrganizationUserId,
          organizationId,
          organizationRole: Membership.roles.ADMIN,
        });

        const userToInviteEmail = databaseBuilder.factory.buildUser().email;
        const code = 'ABCDEFGH01';

        const organizationInvitationId = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId,
          status: OrganizationInvitation.StatusType.PENDING,
          code: code,
        }).id;

        options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitationId}/response`,
          payload: {
            data: {
              id: '100047_DZWMP7L5UM',
              type: 'organization-invitation-responses',
              attributes: {
                code,
                email: userToInviteEmail.toUpperCase(),
              },
            },
          },
        };

        await databaseBuilder.commit();
      });

      it('should return 204 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', function () {
      it('should respond with a 404 if organization-invitation does not exist with id and code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ email: 'user@example.net' });
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({});
        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitation.id}/response`,
          payload: {
            data: {
              id: '100047_DZWMP7L5UM',
              type: 'organization-invitation-responses',
              attributes: {
                code: 'notExistCode',
                email: user.email,
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 409 if organization-invitation is already accepted', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({ email: 'user@example.net' });
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          status: OrganizationInvitation.StatusType.ACCEPTED,
          code: 'DEFRTG123',
        });

        const options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitation.id}/response`,
          payload: {
            data: {
              id: '100047_DZWMP7L5UM',
              type: 'organization-invitation-responses',
              attributes: {
                code: organizationInvitation.code,
                email: user.email,
              },
            },
          },
        };

        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(409);
      });

      it('should respond with a 404 if given email is not linked to an existing user', async function () {
        // given
        const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
          status: OrganizationInvitation.StatusType.PENDING,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitation.id}/response`,
          payload: {
            data: {
              id: '100047_DZWMP7L5UM',
              type: 'organization-invitation-responses',
              attributes: {
                code: organizationInvitation.code,
                email: 'random@email.com',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 412 if membership already exist with userId and OrganizationId', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization();
        const { id: userId, email } = databaseBuilder.factory.buildUser();
        databaseBuilder.factory.buildMembership({ userId, organizationId: organization.id });
        const { id: organizationInvitationId, code } = databaseBuilder.factory.buildOrganizationInvitation({
          organizationId: organization.id,
          status: OrganizationInvitation.StatusType.PENDING,
        });
        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: `/api/organization-invitations/${organizationInvitationId}/response`,
          payload: {
            data: {
              id: '100047_DZWMP7L5UM',
              type: 'organization-invitation-responses',
              attributes: {
                code: code,
                email: email,
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });
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

      it('should return 200 HTTP status code', async function () {
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

      it('should respond with a 400 - missing parameters if organization-invitation is requested without code', async function () {
        // given
        options.url = `/api/organization-invitations/${organizationInvitationId}`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should respond with a 404 if organization-invitation is not found with given id and code', async function () {
        // given
        options.url = `/api/organization-invitations/${organizationInvitationId}?code=999`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 412 if organization-invitation is already accepted', async function () {
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
});
