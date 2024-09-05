import _ from 'lodash';

import { Membership } from '../../../../../src/shared/domain/models/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Team | Admin | Route | membership', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/memberships', function () {
    let options;
    let userId;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      const adminUserId = databaseBuilder.factory.buildUser.withRole().id;
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/admin/memberships',
        payload: {
          data: {
            type: 'memberships',
            attributes: {},
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
      it('returns the created membership', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(_.omit(response.result, ['included', 'data.id'])).to.deep.equal({
          data: {
            type: 'organization-memberships',
            attributes: {
              'organization-role': 'ADMIN',
            },
            relationships: {
              user: {
                data: {
                  type: 'users',
                  id: userId.toString(),
                },
              },
            },
          },
        });
      });

      context('When a membership is disabled', function () {
        it('recreates it', async function () {
          // given
          databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      context('When a membership is not disabled', function () {
        it('does not recreate it', async function () {
          // given
          databaseBuilder.factory.buildMembership({ userId, organizationId });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('PATCH /api/admin/memberships/{id}', function () {
    let options;
    let adminUserId;
    let userId;
    let organizationId;
    let membershipId;
    let newOrganizationRole;

    beforeEach(async function () {
      const externalId = 'externalId';
      adminUserId = databaseBuilder.factory.buildUser.withRole().id;
      organizationId = databaseBuilder.factory.buildOrganization({ externalId, type: 'SCO' }).id;
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
        url: `/api/admin/memberships/${membershipId}`,
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

  describe('GET /api/admin/organizations/{id}/memberships', function () {
    it('returns the matching membership as JSON API', async function () {
      // given
      const userSuperAdmin = databaseBuilder.factory.buildUser.withRole();
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      const membershipId = databaseBuilder.factory.buildMembership({
        userId: user.id,
        organizationId: organization.id,
      }).id;

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/organizations/${organization.id}/memberships?filter[email]=&filter[firstName]=&filter[lastName]=&filter[organizationRole]=`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userSuperAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: [
          {
            attributes: {
              'organization-role': 'MEMBER',
            },
            id: membershipId.toString(),
            relationships: {
              user: {
                data: {
                  id: user.id.toString(),
                  type: 'users',
                },
              },
            },
            type: 'organization-memberships',
          },
        ],
        included: [
          {
            attributes: {
              email: user.email,
              'first-name': user.firstName,
              'last-name': user.lastName,
            },
            id: user.id.toString(),
            type: 'users',
          },
        ],
        meta: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        },
      });
    });
  });
});
