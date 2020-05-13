const _ = require('lodash');

const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | Prescriber-controller', () => {

  let user;
  let organization;
  let membership;
  let userOrgaSettingsId;
  let options;
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  function createExpectedPrescriber({ user, membership, userOrgaSettingsId, organization }) {
    return {
      data: {
        type: 'prescribers',
        attributes: {
          'first-name': user.firstName,
          'last-name': user.lastName,
          'pix-orga-terms-of-service-accepted': false
        },
        relationships: {
          memberships: {
            data: [{
              id: membership.id.toString(),
              type: 'memberships'
            }]
          },
          'user-orga-settings': {
            data: {
              id: userOrgaSettingsId.toString(),
              type: 'userOrgaSettings'
            }
          }
        }
      },
      included: [
        {
          id: organization.id.toString(),
          type: 'organizations',
          attributes: {
            'can-collect-profiles': organization.canCollectProfiles,
            'external-id': organization.externalId,
            'is-managing-students': organization.isManagingStudents,
            'name': organization.name,
            'type': organization.type,
          },
          relationships: {
            memberships: {
              links: {
                related: `/api/organizations/${organization.id}/memberships`
              }
            },
            'organization-invitations': {
              links: {
                related: `/api/organizations/${organization.id}/invitations`
              }
            },
            students: {
              links: {
                related: `/api/organizations/${organization.id}/students`
              }
            },
            'target-profiles': {
              links: {
                related: `/api/organizations/${organization.id}/target-profiles`
              }
            }
          }
        },
        {
          id: membership.id.toString(),
          type: 'memberships',
          attributes: {
            'organization-role': membership.organizationRole
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations'
              }
            }
          }
        },
        {
          id: userOrgaSettingsId.toString(),
          type: 'userOrgaSettings',
          attributes: {
            user: undefined
          },
          relationships: {
            organization: {
              data: {
                id: organization.id.toString(),
                type: 'organizations'
              }
            }
          },
        }
      ]
    };
  }

  describe('GET /api/prescription/prescribers/:id', () => {

    beforeEach(async () => {
      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      membership = databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id });
      userOrgaSettingsId = databaseBuilder.factory.buildUserOrgaSettings({ currentOrganizationId: organization.id, userId: user.id }).id;

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/prescription/prescribers/${user.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async () => {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', () => {

      it('should return found memberships with 200 HTTP status code', async () => {
        // given
        const expectedPrescriber = createExpectedPrescriber({ user, membership, userOrgaSettingsId, organization });

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(_.omit(response.result, ['data.id'])).to.deep.equal(expectedPrescriber);
      });
    });
  });

});
