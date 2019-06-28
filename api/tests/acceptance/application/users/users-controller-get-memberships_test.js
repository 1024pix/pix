const { expect, knex, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

const Membership = require('../../../../lib/domain/models/Membership');

describe('Acceptance | Controller | users-controller-get-memberships', () => {

  let userId;
  let organizationId;
  let membershipId;
  const organizationRole = Membership.roles.OWNER;

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /users/:id/memberships', () => {

    function _insertOrganization(userId) {
      const organizationRaw = {
        name: 'The name of the organization',
        type: 'SUP',
        code: 'AAA111',
        userId,
      };

      return knex('organizations').insert(organizationRaw).returning('id');
    }

    function _insertUser() {
      const userRaw = {
        'firstName': 'john',
        'lastName': 'Doe',
        'email': 'john.Doe@internet.fr',
        password: 'Pix2017!',
      };

      return knex('users').insert(userRaw).returning('id');
    }

    function _insertMemberships(organizationId, userId, organizationRole) {
      const membershipRaw = {
        organizationId,
        userId,
        organizationRole,
      };

      return knex('memberships').insert(membershipRaw).returning('id');
    }

    function _options(userId) {
      return {
        method: 'GET',
        url: `/api/users/${userId}/memberships`,
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
    }

    beforeEach(() => {
      return _insertUser()
        .then(([id]) => userId = id)
        .then(() => _insertOrganization(userId))
        .then(([id]) => organizationId = id)
        .then(() => _insertMemberships(organizationId, userId, Membership.roles.OWNER))
        .then(([id]) => membershipId = id);
    });

    afterEach(() => {
      return knex('users').delete()
        .then(() => knex('organizations').delete())
        .then(() => knex('memberships').delete());
    });

    it('should return found accesses with 200 HTTP status code', () => {
      // when
      const promise = server.inject(_options(userId));

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'memberships',
              id: membershipId.toString(),
              attributes: {
                'organization-role': organizationRole,
              },
              relationships: {
                'organization': { data: { type: 'organizations', id: organizationId.toString() }, },
                'user': { data: null, },
              },
            },
          ],
          included: [
            {
              type: 'organizations',
              id: organizationId.toString(),
              attributes: {
                name: 'The name of the organization',
                type: 'SUP',
                code: 'AAA111',
              },
              relationships: {
                campaigns: {
                  links: {
                    related: `/api/organizations/${organizationId.toString()}/campaigns`
                  }
                },
                'target-profiles': {
                  links: {
                    related: `/api/organizations/${organizationId.toString()}/target-profiles`
                  }
                }
              }
            },
          ],
        });
      });
    });
  });
});
