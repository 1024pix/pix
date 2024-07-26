import { Membership } from '../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

describe('Acceptance | Controller | membership-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/memberships/{id}/disable', function () {
    let options;
    let membershipId;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;
      membershipId = databaseBuilder.factory.buildMembership({ organizationId, userId }).id;
      const organizationAdminUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        userId: organizationAdminUserId,
        organizationId,
        organizationRole: Membership.roles.ADMIN,
      });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: `/api/memberships/${membershipId}/disable`,
        payload: {
          data: {
            id: membershipId.toString(),
            type: 'memberships',
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId,
                },
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: organizationId,
                },
              },
            },
          },
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader(organizationAdminUserId),
        },
      };
    });

    context('Success cases', function () {
      context('When user is admin of the organization', function () {
        it('should return a 204', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('Error cases', function () {
      it('should respond with a 403 if user does not have the role Admin in organization', async function () {
        // given
        const notOrganizationAdminUserId = databaseBuilder.factory.buildUser().id;
        options.headers.authorization = generateValidRequestAuthorizationHeader(notOrganizationAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 400 if membership does not exist', async function () {
        // given
        const unknownMembershipId = 9999;
        options.url = `/api/memberships/${unknownMembershipId}/disable`;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/memberships/me/disable', function () {
    context('when user is one of the admins of the organization', function () {
      it('disables user membership and returns a 204', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const organizationAdminUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({
          userId: organizationAdminUserId,
          organizationId,
          organizationRole: Membership.roles.ADMIN,
        });
        databaseBuilder.factory.buildMembership({
          userId: databaseBuilder.factory.buildUser().id,
          organizationId,
          organizationRole: Membership.roles.ADMIN,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'POST',
          url: '/api/memberships/me/disable',
          payload: {
            organizationId,
          },
          headers: {
            authorization: generateValidRequestAuthorizationHeader(organizationAdminUserId),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
