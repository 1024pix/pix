const { expect, knex } = require('../../../test-helper');
const faker = require('faker');

const createServer = require('../../../../server');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');

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
      return knex('reset-password-demands').delete()
        .then(() => knex('users').delete());
    });

    context('with a passwordResetDemand', () => {
      let temporaryKey;

      beforeEach(() => {
        temporaryKey = passwordResetService.generateTemporaryKey();
        return _insertPasswordResetDemand(temporaryKey, fakeUserEmail);
      });

      it('should reply with an error, when temporary key is invalid', () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${userId}?temporary-key=bad-temporary-key`,
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
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
        });
      });

      it('should reply with 204 status code, when password is updated', () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${userId}?temporary-key=${temporaryKey}`,
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
        return promise.then((response) => {
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('without a passwordResetDemand', () => {

      it('should reply with 404 status code, when user has not a password reset demand in progress', async () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${userId}?temporary-key=bad-temporary-key`,
          payload: {
            data: {
              id: '2',
              attributes: {
                password: 'Pix2017!'
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
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

    context('with hasSeenMigrationModal field', () => {

      it('should reply 204 status code', async () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${userId}`,
          payload: {
            data: {
              attributes: {
                'has-seen-migration-modal': true
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
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

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
