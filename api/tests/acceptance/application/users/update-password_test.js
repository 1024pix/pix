const { expect, knex, databaseBuilder } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-update-password', () => {

  let server;
  let user;
  let options;
  const temporaryKey = 'good-temporary-key';

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ email: 'harry.cover@truc.so', password: 'Pix2018!' });
    await databaseBuilder.commit();
    await _insertPasswordResetDemand(temporaryKey, user.email);
  });

  afterEach(async () => {
    await knex('reset-password-demands').delete();
    await databaseBuilder.clean();
  });

  describe('Error case', () => {

    it('should reply with an error, when temporary key is invalid', async () => {
      // given
      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/update-password?temporary-key=bad-temporary-key`,
        payload: {
          data: {
            id: user.id,
            attributes: {
              password: 'Pix2018!'
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

  describe('Success case', () => {

    it('should reply with 200 status code, when password is updated', async () => {
      // given
      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/update-password?temporary-key=${temporaryKey}`,
        payload: {
          data: {
            id: user.id,
            attributes: {
              password: 'Pix2018!'
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

function _insertPasswordResetDemand(temporaryKey, email) {
  const resetDemandRaw = { email, temporaryKey };
  return knex('reset-password-demands').insert(resetDemandRaw);
}
