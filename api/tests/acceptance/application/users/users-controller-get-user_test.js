const { expect, knex, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const faker = require('faker');
const server = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user', () => {

  let options;

  beforeEach(() => {
    options = {
      method: 'GET',
      url: '/api/users/1234',
      payload: { },
      headers: { authorization: generateValidRequestAuhorizationHeader() },
    };
  });

  describe('GET /users/:id', () => {

    const userToInsert = {
      id: 1234,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: 'A124B2C3#!',
      cgu: true
    };

    beforeEach(() => {
      return knex('users').insert(userToInsert);
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should return found user with 200 HTTP status code', () => {
      // given
      const expectedUserJSONApi = {
        data: {
          type: 'users',
          id: 1234,
          attributes: {
            'first-name': userToInsert.firstName,
            'last-name': userToInsert.lastName,
            'email': userToInsert.email.toLowerCase(),
            'cgu': true
          },
          relationships: {
            'organization-accesses': {
              links: {
                related: '/users/1234/organization-accesses'
              }
            }
          }
        }
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedUserJSONApi);
      });
    });
  });

});
