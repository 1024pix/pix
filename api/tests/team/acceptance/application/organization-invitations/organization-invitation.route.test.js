import lodash from 'lodash';

import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
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

  describe('POST /api/organizations/{id}/invitations', function () {
    let organization;
    let user1;
    let user2;
    let options;

    beforeEach(async function () {
      const adminUserId = databaseBuilder.factory.buildUser().id;
      organization = databaseBuilder.factory.buildOrganization();
      databaseBuilder.factory.buildMembership({
        userId: adminUserId,
        organizationId: organization.id,
        organizationRole: Membership.roles.ADMIN,
      });

      user1 = databaseBuilder.factory.buildUser();
      user2 = databaseBuilder.factory.buildUser();

      options = {
        method: 'POST',
        url: `/api/organizations/${organization.id}/invitations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(adminUserId) },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: `${user1.email},${user2.email}`,
            },
          },
        },
      };

      await databaseBuilder.commit();
    });

    context('Expected output', function () {
      it('should return the matching organization-invitations as JSON API', async function () {
        // given
        const status = OrganizationInvitation.StatusType.PENDING;
        const expectedResults = [
          {
            type: 'organization-invitations',
            attributes: {
              'organization-id': organization.id,
              email: user1.email,
              status,
              role: null,
            },
          },
          {
            type: 'organization-invitations',
            attributes: {
              'organization-id': organization.id,
              email: user2.email,
              status,
              role: null,
            },
          },
        ];

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.length).equal(2);
        expect(
          _omit(response.result.data[0], 'id', 'attributes.updated-at', 'attributes.organization-name'),
        ).to.deep.equal(expectedResults[0]);
        expect(
          _omit(response.result.data[1], 'id', 'attributes.updated-at', 'attributes.organization-name'),
        ).to.deep.equal(expectedResults[1]);
      });
    });

    context('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not ADMIN in organization', async function () {
        // given
        const nonAdminUserId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 201 - created - if user is ADMIN in organization', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
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
