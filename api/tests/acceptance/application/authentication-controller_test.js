const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const _ = require('lodash');
const querystring = require('querystring');

const jsonwebtoken = require('jsonwebtoken');
const settings = require('./../../../lib/settings');

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

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('POST /api/authentications', () => {

    const options = {
      method: 'POST',
      url: '/api/authentications',
      payload: {
        data: {
          type: 'user',
          attributes: {
            email: userEmail,
            password: userPassword,
          },
          relationships: {}
        }
      },
      headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
    };

    it('should return 201 HTTP status code', () => {
      // given
      const expectedToken = jsonwebtoken.sign({
        user_id: userId,
        source: 'pix'
      }, settings.authentication.secret, { expiresIn: settings.authentication.tokenLifespan });

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
        expect(response.result).to.deep.equal({
          data: {
            id: userId.toString(),
            type: 'authentications',
            attributes: {
              'user-id': userId.toString(),
              token: expectedToken,
              password: ''
            }
          }
        });
      });
    });

    it('should return 201 HTTP status code when missing authorization header', () => {
      // given
      options.headers = {};

      // when
      const promise = server.inject(options);

      // given
      return promise.then((response) => {
        expect(response.statusCode).to.equal(201);
      });
    });
  });

  describe('POST /api/token', () => {

    beforeEach(async () => {
      const organizationId = databaseBuilder.factory.buildOrganization({}).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId, organizationRoleId: orgaRoleInDB.id });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
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
        expect(result.expires_in).to.equal(3600);
        expect(result.access_token).to.exist;
        expect(result.user_id).to.equal(userId);
      });
    });

  });

})
;
