const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const querystring = require('querystring');

const moduleUnderTest = require('../../../../lib/application/authentication');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');

describe('Integration | Application | Route | AuthenticationRouter', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(authenticationController, 'authenticateUser').callsFake((request, h) => h.response({
      token_type: 'bearer',
      access_token: 'some-jwt-access-token',
      user_id: 'the-user-id',
    }));
    sinon.stub(authenticationController, 'authenticatePoleEmploiUser').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(authenticationController, 'authenticateAnonymousUser').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest, true);
  });

  describe('POST /api/token', () => {

    const method = 'POST';
    const url = '/api/token';
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
    };

    let payload;

    beforeEach(() => {
      payload = querystring.stringify({
        grant_type: 'password',
        username: 'user.username2453  ',
        password: 'user_password',
        scope: 'pix-orga',
      });
    });

    it('should return a response with HTTP status code 200 even if there is no scope in the request', async () => {
      // given
      payload = querystring.stringify({
        grant_type: 'password',
        username: 'user@email.com',
        password: 'user_password',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 when grant type is not "password"', async () => {
      // given
      payload = querystring.stringify({
        grant_type: 'authorization_code',
        username: 'valid@email.com',
        password: 'valid_password',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 when username is missing', async () => {
      // given
      payload = querystring.stringify({
        grant_type: 'password',
        password: 'valid_password',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 when password is missing', async () => {
      // given
      payload = querystring.stringify({
        grant_type: 'password',
        username: 'valid@email.com',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 when username is not an email', async () => {
      // given
      payload = querystring.stringify({
        grant_type: 'authorization_code',
        username: 'a_login_not_an_email',
        password: 'valid_password',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a JSON API error (415) when request "Content-Type" header is not "application/x-www-form-urlencoded"', async () => {
      // given
      headers['content-type'] = 'text/html';

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(415);
    });
  });

  describe('POST /revoke', () => {

    const method = 'POST';
    const url = '/api/revoke';
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
    };

    let payload;

    beforeEach(() => {
      payload = querystring.stringify({
        token: 'jwt.access.token',
        token_type_hint: 'access_token',
      });
    });

    it('should return a response with HTTP status code 204 when route handler (a.k.a. controller) is successful', async () => {
      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return a 400 when grant type is not "access_token" nor "refresh_token"', async () => {
      // given
      payload = querystring.stringify({
        token: 'jwt.access.token',
        token_type_hint: 'not_standard_token_type',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 when token is missing', async () => {
      // given
      payload = querystring.stringify({
        token_type_hint: 'access_token',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a response with HTTP status code 204 even when token type hint is missing', async () => {
      // given
      payload = querystring.stringify({
        token: 'jwt.access.token',
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return a JSON API error (415) when request "Content-Type" header is not "application/x-www-form-urlencoded"', async () => {
      // given
      headers['content-type'] = 'text/html';

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(415);
    });
  });

  describe('POST /api/token-from-external-user', () => {

    const method = 'POST';
    const url = '/api/token-from-external-user';

    let payload;

    beforeEach(() => {
      payload = {
        data: {
          attributes: {
            username: 'saml.jackson0101',
            password: 'password',
            'external-user-token': 'expectedExternalToken',
            'expected-user-id': 1,
          },
          type: 'external-user-authentication-requests',
        },
      };
    });

    it('should return a 400 Bad Request if username is missing', async () => {
      // given
      payload.data.attributes.username = undefined;

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 Bad Request if password is missing', async () => {
      // given
      payload.data.attributes.password = undefined;

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 Bad Request if external-user-token is missing', async () => {
      // given
      payload.data.attributes['external-user-token'] = undefined;

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 Bad Request if expected-user-id is missing', async () => {
      // given
      payload.data.attributes['expected-user-id'] = undefined;

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/pole-emploi/token', () => {

    const method = 'POST';
    const url = '/api/pole-emploi/token';
    const headers = {};

    const code = 'ABCD';
    const client_id = 'CLIENT_ID';
    const redirect_uri = 'http://redirectUri.fr';

    let payload;

    beforeEach(() => {
      headers['content-type'] = 'application/x-www-form-urlencoded';

      payload = querystring.stringify({
        code,
        client_id,
        redirect_uri,
      });
    });

    it('should return a response with HTTP status code 200', async () => {
      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 415 when headers content-type is wrong', async () => {
      // given
      headers['content-type'] = 'application/json';

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(415);
    });

    it('should return 400 when payload is missing', async () => {
      // given
      payload = undefined;

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when code is missing', async () => {
      // given
      payload = querystring.stringify({
        client_id,
        redirect_uri,
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when client_id is missing', async () => {
      // given
      payload = querystring.stringify({
        code,
        redirect_uri,
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 400 when redirect_uri is missing', async () => {
      // given
      payload = querystring.stringify({
        code,
        client_id,
      });

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/token/anonymous', () => {

    const method = 'POST';
    const url = '/api/token/anonymous';
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
    };
    const code = 'SIMPLIFIE';

    let payload;

    beforeEach(() => {
      payload = querystring.stringify({
        campaign_code: code,
        lang: 'fr',
      });
    });

    it('should return a response with HTTP status code 200', async () => {
      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 when campaignCode is missing', async () => {
      // given
      payload = querystring.stringify({});

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
