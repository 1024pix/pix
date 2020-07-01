const _ = require('lodash');
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../test-helper');

const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');

describe('Acceptance | Controller | membership-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('PATCH /api/memberships/{id}', () => {

    let options;
    let userId;
    let organizationId;
    let membershipId;
    let newOrganizationRole;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
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
                  id: userId
                }
              },
              organization: {
                data : {
                  type: 'organizations',
                  id: organizationId
                }
              }
            }
          }
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminUserId)
        },
      };
    });

    context('Success cases', () => {

      it('should return the updated membership', async () => {
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
                  id: userId.toString()
                }
              },
              organization: {
                data: {
                  type: 'organizations',
                  id: organizationId.toString()
                }
              }
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

    beforeEach(async () => {
      await insertUserWithRolePixMaster();

      const organizationId = databaseBuilder.factory.buildOrganization().id;
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
          }
        },
        headers: {
          authorization: generateValidRequestAuthorizationHeader()
        },
      };
    });

    context('Success cases', () => {

      it('should return a 204', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
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
