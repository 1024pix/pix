const { describe, it, after, afterEach, before, expect, knex } = require('../../test-helper');
const faker = require('faker');

const server = require('../../../server');
const passwordResetService = require('../../../lib/domain/services/reset-password-service');

describe('Acceptance | Controller | users-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('Patch /api/users/{id}', () => {
    let fakeUserEmail;
    let userId;
    let options;
    const temporaryKey = passwordResetService.generateTemporaryKey();

    before(async () => {
      fakeUserEmail = faker.internet.email();
      userId = await _insertUser(fakeUserEmail);
    });

    afterEach(() => {
      return Promise.all([knex('users').delete(), knex('reset-password-demands').delete()]);
    });

    it('should reply with 204 status code, when password is updated', async () => {
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

      await _insertPasswordResetDemand(temporaryKey, fakeUserEmail);

      // when
      return server.inject(options).then((response) => {
        // then
        expect(response.statusCode).to.equal(204);
      });
    });

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
      return server.inject(options).then((response) => {
        // then
        expect(response.statusCode).to.equal(404);
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

  return knex('users').insert(userRaw)
    .then(user => user.shift());
}

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
