const { expect, knex } = require('../../../test-helper');
const faker = require('faker');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('Patch /api/users/{id}', () => {
    let userId;
    let options;
    let fakeUserEmail;

    beforeEach(() => {
      fakeUserEmail = faker.internet.email();
      return _insertUser(fakeUserEmail)
        .then(([id]) => userId = id);
    });

    afterEach(() => {
      return knex('users').delete();
    });

    context('with a terms of service acceptation', () => {

      it('should reply 204 status code, when user accepts pix-orga terms of service', () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${userId}`,
          payload: {
            data: {
              attributes: {
                'pix-orga-terms-of-service-accepted': true
              }
            }
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(204);
        });
      });
    });
  });
});

function _insertUser(email) {
  const userRaw = {
    'firstName': faker.name.firstName(),
    'lastName': faker.name.lastName(),
    email,
    password: 'Pix2017!'
  };

  return knex('users').insert(userRaw).returning('id');
}
