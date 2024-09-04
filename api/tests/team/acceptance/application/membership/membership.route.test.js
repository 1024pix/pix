import _ from 'lodash';

import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Team | Application | Route | membership', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/memberships/{id}', function () {
    let options;
    let userId;
    let organizationId;
    let membershipId;
    let newOrganizationRole;

    beforeEach(async function () {
      const externalId = 'externalId';
      organizationId = databaseBuilder.factory.buildOrganization({ externalId, type: 'SCO' }).id;
      const adminUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: adminUserId,
        organizationRole: Membership.roles.ADMIN,
      });

      userId = databaseBuilder.factory.buildUser().id;
      membershipId = databaseBuilder.factory.buildMembership({
        organizationId,
        userId,
        organizationRole: Membership.roles.MEMBER,
      }).id;
      databaseBuilder.factory.buildCertificationCenter({ externalId });

      await databaseBuilder.commit();

      newOrganizationRole = Membership.roles.ADMIN;
      options = {
        method: 'PATCH',
        url: `/api/memberships/${membershipId}`,
        payload: {
          data: {
            id: membershipId.toString(),
            type: 'memberships',
            attributes: {
              'organization-role': newOrganizationRole,
            },
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
          authorization: generateValidRequestAuthorizationHeader(adminUserId),
        },
      };
    });

    context('Success cases', function () {
      it('returns the updated membership and add certification center membership', async function () {
        // given
        const expectedMembership = {
          data: {
            type: 'memberships',
            id: membershipId.toString(),
            attributes: {
              'organization-role': newOrganizationRole,
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId.toString(),
                },
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: organizationId.toString(),
                },
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(_.omit(response.result, 'included')).to.deep.equal(expectedMembership);
      });
    });

    context('Error cases', function () {
      it('responds with a 403 if user is not admin of membership organization', async function () {
        // given
        const notAdminUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({
          organizationId,
          userId: notAdminUserId,
          organizationRole: Membership.roles.MEMBER,
        });
        await databaseBuilder.commit();

        options.headers.authorization = generateValidRequestAuthorizationHeader(notAdminUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('responds with a 400 if membership does not exist', async function () {
        // given
        options.url = '/api/memberships/NOT_NUMERIC';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        const firstError = response.result.errors[0];
        expect(firstError.detail).to.equal('"id" must be a number');
      });
    });
  });

  describe('GET /api/organizations/{id}/memberships', function () {
    context('Expected output', function () {
      it('returns the matching membership as JSON API', async function () {
        // given
        const adminOfTheOrganization = databaseBuilder.factory.buildUser();
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const adminMembershipId = databaseBuilder.factory.buildMembership({
          organizationId,
          userId: adminOfTheOrganization.id,
          organizationRole: 'ADMIN',
        }).id;

        const userToUpdateMembership = databaseBuilder.factory.buildUser();
        const membershipId = databaseBuilder.factory.buildMembership({
          userId: userToUpdateMembership.id,
          organizationId: organizationId,
        }).id;

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/memberships/?filter[email]=&filter[firstName]=&filter[lastName]=&filter[organizationRole]=`,
          headers: { authorization: generateValidRequestAuthorizationHeader(adminOfTheOrganization.id) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              attributes: {
                'organization-role': 'ADMIN',
              },
              id: adminMembershipId.toString(),
              relationships: {
                user: {
                  data: {
                    id: adminOfTheOrganization.id.toString(),
                    type: 'users',
                  },
                },
              },
              type: 'memberships',
            },
            {
              attributes: {
                'organization-role': 'MEMBER',
              },
              id: membershipId.toString(),
              relationships: {
                user: {
                  data: {
                    id: userToUpdateMembership.id.toString(),
                    type: 'users',
                  },
                },
              },
              type: 'memberships',
            },
          ],
          included: [
            {
              attributes: {
                email: adminOfTheOrganization.email,
                'first-name': adminOfTheOrganization.firstName,
                'last-name': adminOfTheOrganization.lastName,
              },
              id: adminOfTheOrganization.id.toString(),
              type: 'users',
            },
            {
              attributes: {
                email: userToUpdateMembership.email,
                'first-name': userToUpdateMembership.firstName,
                'last-name': userToUpdateMembership.lastName,
              },
              id: userToUpdateMembership.id.toString(),
              type: 'users',
            },
          ],
          meta: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            rowCount: 2,
          },
        });
      });
    });

    context('Resource access management', function () {
      it('responds with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const authorization = 'invalid.access.token';

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/memberships`,
          headers: { authorization },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('responds with a 403 - forbidden access - if user is not in organization nor is SUPERADMIN', async function () {
        // given
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildMembership({
          organizationRole: Membership.roles.MEMBER,
          organizationId: otherOrganizationId,
          userId,
        });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/organizations/${organizationId}/memberships`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
