const { expect, knex } = require('../../../test-helper');
const faker = require('faker');

const server = require('../../../../server');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');

describe('Acceptance | Controller | users-controller', () => {

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
      return knex('reset-password-demands').delete()
        .then(() => knex('users').delete());
    });

    context('with a passwordResetDemand', () => {

      beforeEach(() => {
        const temporaryKey = passwordResetService.generateTemporaryKey();
        return _insertPasswordResetDemand(temporaryKey, fakeUserEmail);
      });

      it('should reply with 204 status code, when password is updated', () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${userId}`,
          payload: {
            data: {
              attributes: {
                password: 'Pix2017!'
              }
            }
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then(response => {
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('without a passwordResetDemand', () => {

      it('should reply with 404 status code, when user has not a password reset demand in progress', () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${userId}`,
          payload: {
            data: {
              attributes: {
                password: 'Pix2017!'
              }
            }
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then(response => {
          expect(response.statusCode).to.equal(404);
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

  return knex('users').insert(userRaw, 'id');
}

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
