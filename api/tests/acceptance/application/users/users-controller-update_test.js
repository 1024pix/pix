const { databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

const createServer = require('../../../../server');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');

describe('Acceptance | Controller | users-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('Patch /api/users/{id}', () => {
    let user;
    let options;

    beforeEach(async () => {
      server = await createServer();

      user = databaseBuilder.factory.buildUser({ password: 'Pix2017!' });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('reset-password-demands').delete();
      await databaseBuilder.clean();
    });

    context('with a passwordResetDemand', () => {
      let temporaryKey;

      beforeEach(() => {
        temporaryKey = passwordResetService.generateTemporaryKey();
        return _insertPasswordResetDemand(temporaryKey, user.email);
      });

      it('should reply with an error, when temporary key is invalid', () => {
        // given
        options = {
          method: 'PATCH',
          url: `/api/users/${user.id}?temporary-key=bad-temporary-key`,
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
          url: `/api/users/${user.id}?temporary-key=${temporaryKey}`,
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
          url: `/api/users/${user.id}?temporary-key=bad-temporary-key`,
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
  });
});

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
