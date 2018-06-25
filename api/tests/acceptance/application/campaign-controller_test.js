const faker = require('faker');
const server = require('../../../server');
const { knex, expect, generateValidRequestAuhorizationHeader } = require('../../test-helper');

describe('Acceptance | API | Campaigns', () => {

  describe('POST /api/campaigns', () => {

    let organizationInDbId;

    beforeEach(() => {
      const organizationAccess = {};

      return knex('users').insert({
        id: 1234,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'myemail@example.net',
        password: 'oizjef76235hb',
        cgu: true
      })
        .then((insertedUser) => {
          organizationAccess.userId = insertedUser[0];
          return knex('organizations').insert({ email: 'trololo@example.net', type: 'PRO', name: 'Mon Entreprise', code: 'ABCD12' });
        }).then((insertedOrganization) => {
          organizationInDbId = insertedOrganization[0];
          organizationAccess.organizationId = organizationInDbId;
          return knex('organization-roles').insert({ name: 'ADMIN' });
        })
        .then((insertedOrganizationRole) => {
          organizationAccess.organizationRoleId = insertedOrganizationRole[0];
          return knex('organizations-accesses').insert(organizationAccess);
        });
    });

    afterEach(() => {
      return knex('organizations-accesses').delete()
        .then(() => {
          return Promise.all([
            knex('organizations').delete(),
            knex('users').delete(),
            knex('organization-roles').delete()
          ]);
        });
    });

    it('should return 201 and the campaign when it has been successfully created', function() {
      const options = {
        method: 'POST',
        url: '/api/campaigns',
        headers: { authorization: generateValidRequestAuhorizationHeader() },
        payload: {
          data: {
            type: 'campaigns',
            attributes: {
              name: 'L‘hymne de nos campagnes',
              'organization-id': organizationInDbId,
            }
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal('campaigns');
        expect(response.result.data.attributes.name).to.equal('L‘hymne de nos campagnes');
        expect(response.result.data.attributes.code).to.exist;
      });
    });
  });
});
