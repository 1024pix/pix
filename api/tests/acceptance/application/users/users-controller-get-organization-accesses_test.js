const { expect, knex, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const server = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-organization-accesses', () => {

  let userId;
  let organizationId;
  let organizationAccessId;
  let organizationRoleId;

  describe('GET /users/:id/organization-accesses', () => {

    function _insertOrganization(userId) {
      const organizationRaw = {
        name: 'The name of the organization',
        email: 'organization@email.com',
        type: 'SUP',
        code: 'AAA111',
        userId
      };

      return knex('organizations').insert(organizationRaw).returning('id');
    }

    function _insertUser() {
      const userRaw = {
        'firstName': 'john',
        'lastName': 'Doe',
        'email': 'john.Doe@internet.fr',
        password: 'Pix2017!'
      };

      return knex('users').insert(userRaw).returning('id');
    }

    function _insertOrganizationAccesses(organizationId, userId, organizationRoleId) {
      const organizationAccessRaw = {
        organizationId,
        userId,
        organizationRoleId
      };

      return knex('organizations-accesses').insert(organizationAccessRaw).returning('id');
    }

    function _insertOrganizationRoles() {
      const organizationRoleRaw = {
        name: 'ADMIN'
      };

      return knex('organization-roles').insert(organizationRoleRaw).returning('id');
    }

    function _options(userId) {
      return {
        method: 'GET',
        url: `/api/users/${userId}/organization-accesses`,
        headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
      };
    }

    beforeEach(() => {
      return _insertUser()
        .then(([id]) => userId = id)
        .then(() => _insertOrganization(userId))
        .then(([id]) => organizationId = id)
        .then(() => _insertOrganizationRoles()
          .then(([id]) => organizationRoleId = id)
          .then(() => _insertOrganizationAccesses(organizationId, userId, organizationRoleId))
          .then(([id]) => organizationAccessId = id));
    });

    afterEach(() => {
      return knex('users').delete()
        .then(() => knex('organizations').delete())
        .then(() => knex('organizations-accesses').delete());
    });

    it('should return found accesses with 200 HTTP status code', () => {
      // when
      const promise = server.inject(_options(userId));

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal({
          data: [
            {
              type: 'organizations-accesses',
              id: organizationAccessId,
              attributes: {},
              relationships: {
                organization: {
                  data:
                    { type: 'organizations', id: organizationId.toString() }
                }
              }
            }
          ],
          included: [
            {
              type: 'organizations',
              id: organizationId.toString(),
              attributes: {
                name: 'The name of the organization',
                type: 'SUP',
                code: 'AAA111',
              }
            }
          ]
        });
      });
    });
  });

});
