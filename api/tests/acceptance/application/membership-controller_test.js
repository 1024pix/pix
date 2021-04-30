const _ = require('lodash');
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster, knex } = require('../../test-helper');

const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');

describe('Acceptance | Controller | membership-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/memberships', () => {

    let options;
    let userId;
    let organizationId;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      const adminUserId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/memberships',
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

    context('Success cases', () => {

      afterEach(() => {
        return knex('memberships').delete();
      });

      it('should return the created membership', async () => {
        // given
        const expectedMembership = {
          data: {
            type: 'memberships',
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
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(_.omit(response.result, ['included', 'data.id'])).to.deep.equal(expectedMembership);
      });

      context('When a membership is disabled', () => {

        it('should be able to recreate it', async () => {
          // given
          databaseBuilder.factory.buildMembership({ userId, organizationId, disabledAt: new Date() });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
        });
      });

      context('When a membership is not disabled', () => {

        it('should not be able to recreate it', async () => {
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

  describe('PATCH /api/memberships/{id}', () => {

    let options;
    let userId;
    let organizationId;
    let membershipId;
    let newOrganizationRole;

    beforeEach(async () => {
      const externalId = 'externalId';
      organizationId = databaseBuilder.factory.buildOrganization({ externalId }).id;
      const adminUserId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: adminUserId,
        organizationRole: Membership.roles.ADMIN,
      });

      userId = databaseBuilder.factory.buildUser().id;
      membershipId = databaseBuilder.factory.buildMembership({
        organizationId, userId,
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

    context('Success cases', () => {

      afterEach(async () => {
        await knex('certification-center-memberships').delete();
      });

      it('should return the updated membership and add certification center membership', async () => {
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

    context('Error cases', () => {

      it('should respond with a 403 if user is not admin of membership organization', async () => {
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

      it('should respond with a 400 if membership does not exist', async () => {
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

  describe('POST /api/memberships/{id}/disable', () => {

    let options;
    let membershipId;
    let organizationId;

    beforeEach(async () => {
      await insertUserWithRolePixMaster();

      organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;
      membershipId = databaseBuilder.factory.buildMembership({ organizationId, userId }).id;

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
          authorization: generateValidRequestAuthorizationHeader(),
        },
      };
    });

    context('Success cases', () => {

      context('When user is Pix Master', () => {
        it('should return a 204', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });

      context('When user is admin of the organization', () => {

        beforeEach(async () => {
          // given
          const organizationAdminUserId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildMembership({ userId: organizationAdminUserId, organizationId, organizationRole: Membership.roles.ADMIN });
          options.headers.authorization = generateValidRequestAuthorizationHeader(organizationAdminUserId);

          await databaseBuilder.commit();
        });

        it('should return a 204', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });

    });

    context('Error cases', () => {

      it('should respond with a 403 if user does not have the role PIX MASTER', async () => {
        // given
        const notPixMasterUserId = 1;
        options.headers.authorization = generateValidRequestAuthorizationHeader(notPixMasterUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });

      it('should respond with a 400 if membership does not exist', async () => {
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

});
