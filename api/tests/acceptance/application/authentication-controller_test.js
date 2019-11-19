const { expect, databaseBuilder } = require('../../test-helper');
const _ = require('lodash');
const querystring = require('querystring');

const createServer = require('../../../server');

describe('Acceptance | Controller | authentication-controller', () => {

  let userId;
  const orgaRoleInDB = { id: 1, name: 'ADMIN' };
  const userEmail = 'emailWithSomeCamelCase@example.net';
  const userEmailSavedInDb = _.toLower(userEmail);
  const userPassword = 'A124B2C3#!';

  let server;

  beforeEach(async () => {
    server = await createServer();
    userId = databaseBuilder.factory.buildUser(
      {
        email: userEmailSavedInDb,
        password: userPassword,
        cgu: true,
      }).id;
    await databaseBuilder.commit();
  });

  describe('POST /api/token', () => {

    beforeEach(async () => {
      const organizationId = databaseBuilder.factory.buildOrganization({}).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRoleId: orgaRoleInDB.id });
      await databaseBuilder.commit();
    });

    it('should return an 200 with accessToken when authentication is ok', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        payload: querystring.stringify({
          grant_type: 'password',
          username: userEmailSavedInDb,
          password: userPassword,
          scope: 'pix-orga'
        })
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);

        const result = response.result;
        expect(result.token_type).to.equal('bearer');
        expect(result.access_token).to.exist;
        expect(result.user_id).to.equal(userId);
      });
    });
  });

});
