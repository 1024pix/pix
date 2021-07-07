const {
  databaseBuilder,
  expect,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | Account-recovery', () => {

  describe('POST /api/account-recovery', () => {

    it('should return 201 HTTP status code', async () => {
      // given
      const server = await createServer();

      const newEmail = 'new_email@example.net';
      const user = databaseBuilder.factory.buildUser.withRawPassword({ id: 8 });
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'user-id': user.id,
              email: newEmail,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return 400 if email already exists', async () => {
      // given
      const server = await createServer();

      const newEmail = 'new_email@example.net';
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 8,
        email: 'new_email@example.net',
      });
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/account-recovery',
        payload: {
          data: {
            attributes: {
              'user-id': user.id,
              email: newEmail,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('Cette adresse e-mail est déjà utilisée.');
    });
  });

});
