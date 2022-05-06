const querystring = require('querystring');
const jsonwebtoken = require('jsonwebtoken');
const { expect, databaseBuilder, knex, nock } = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Route | cnav token', function () {
  describe('POST /api/cnav/token', function () {
    context('when the state sent does not match the state received', function () {
      it('should return http code 400', async function () {
        // given
        const server = await createServer();
        const cnavIdToken = jsonwebtoken.sign(
          {
            given_name: 'Claire',
            family_name: 'Hyère',
            nonce: 'nonce',
            sub: 'some-unique-user-id',
          },
          'secret'
        );
        const getAccessTokenResponse = {
          id_token: cnavIdToken,
        };
        nock('http://idp.cnav').post('/token').reply(200, getAccessTokenResponse);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/cnav/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'a_state',
            state_received: 'another_state',
          }),
        });

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when user has no pix account', function () {
      it('should return http code 401 with authentication key in meta', async function () {
        // given
        const server = await createServer();
        const cnavIdToken = jsonwebtoken.sign(
          {
            given_name: 'Claire',
            family_name: 'Hyère',
            nonce: 'nonce',
            sub: 'some-unique-user-id',
          },
          'secret'
        );

        const getAccessTokenResponse = {
          id_token: cnavIdToken,
        };
        nock('http://idp.cnav').post('/token').reply(200, getAccessTokenResponse);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/cnav/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'state',
            state_received: 'state',
          }),
        });

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].code).to.equal('SHOULD_VALIDATE_CGU');
        expect(response.result.errors[0].meta.authenticationKey).to.exist;
      });
    });

    context('when user has a pix account', function () {
      afterEach(async function () {
        await knex('authentication-methods').delete();
        await knex('users').delete();
      });

      it('should return an 200 with access token', async function () {
        // given
        const server = await createServer();
        const cnavIdToken = jsonwebtoken.sign(
          {
            given_name: 'Claire',
            family_name: 'Hyère',
            nonce: 'nonce',
            sub: 'some-unique-user-id',
          },
          'secret'
        );
        const getAccessTokenResponse = {
          id_token: cnavIdToken,
        };
        const getAccessTokenRequest = nock('http://idp.cnav').post('/token').reply(200, getAccessTokenResponse);

        databaseBuilder.factory.buildAuthenticationMethod.withCnavAsIdentityProvider({
          externalIdentifier: 'some-unique-user-id',
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/cnav/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'state',
            state_received: 'state',
          }),
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(getAccessTokenRequest.isDone()).to.be.true;
        expect(response.result['access_token']).to.exist;
      });
    });

    context('when cnav request fail', function () {
      it('should return HTTP 500 with error detail', async function () {
        // given
        const server = await createServer();
        const errorData = {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        };
        nock('http://idp.cnav').post('/token').reply(400, errorData);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/cnav/token',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: querystring.stringify({
            code: 'code',
            redirect_uri: 'redirect_uri',
            state_sent: 'state',
            state_received: 'state',
          }),
        });

        // expect
        expect(response.statusCode).to.equal(500);
        expect(response.result.errors[0].detail).to.equal(
          '{"error":"invalid_client","error_description":"Invalid authentication method for accessing this endpoint."}'
        );
      });
    });
  });
});
