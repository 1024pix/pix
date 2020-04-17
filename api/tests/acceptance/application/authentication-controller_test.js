const { expect, databaseBuilder } = require('../../test-helper');
const querystring = require('querystring');

const createServer = require('../../../server');

describe('Acceptance | Controller | authentication-controller', () => {

  const orgaRoleInDB = { id: 1, name: 'ADMIN' };

  const userEmailAddress = 'user@example.net';
  const userPassword = 'A124B2C3#!';

  let server;
  let userId;

  beforeEach(async () => {
    server = await createServer();

    userId = databaseBuilder.factory.buildUser.withUnencryptedPassword({
      email: userEmailAddress,
      rawPassword: userPassword,
      cgu: true,
    }).id;

    await databaseBuilder.commit();
  });

  describe('POST /api/token', () => {

    let options;

    beforeEach(async () => {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRoleId: orgaRoleInDB.id });

      options = {
        method: 'POST',
        url: '/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        payload: querystring.stringify({
          grant_type: 'password',
          username: userEmailAddress,
          password: userPassword,
          scope: 'pix-orga'
        })
      };

      await databaseBuilder.commit();
    });

    it('should return an 200 with accessToken when authentication is ok', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      const result = response.result;
      expect(result.token_type).to.equal('bearer');
      expect(result.access_token).to.exist;
      expect(result.user_id).to.equal(userId);
    });

    it('should return http code 401 when user should change password', async () => {
      // given
      const username = 'username123';
      const shouldChangePassword = true;

      databaseBuilder.factory.buildUser.withUnencryptedPassword({
        username,
        rawPassword: userPassword,
        cgu: true,
        shouldChangePassword
      });

      const expectedResponseError = {
        errors: [
          {
            title: 'PasswordShouldChange',
            status: '401',
            detail: 'Erreur, vous devez changer votre mot de passe.'
          }
        ]
      };

      options.payload = querystring.stringify({
        grant_type: 'password',
        username,
        password: userPassword,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
      expect(response.result).to.deep.equal(expectedResponseError);
    });
  });

});
