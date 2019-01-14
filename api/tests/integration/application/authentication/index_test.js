const Hapi = require('hapi');
const querystring = require('querystring');
const { expect, sinon } = require('../../../test-helper');
const authenticationController = require('../../../../lib/application/authentication/authentication-controller');

describe('Integration | Application | Route | AuthenticationRouter', () => {

  let server;
  const jsonApiError = {
    errors:
      [{
        code: '400',
        title: 'Bad request',
        detail: 'The server could not understand the request due to invalid syntax.',
      }]
  };

  beforeEach(() => {
    // stub dependencies
    sinon.stub(authenticationController, 'save').returns('ok');

    // configure and start server
    server = Hapi.server();

    return server.register(require('../../../../lib/application/authentication'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/authentications', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/authentications'
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/token', () => {

    let options;
    let server;
    let useCaseResult;

    beforeEach(() => {
      // configure a request (valid by default)
      options = {
        method: 'POST',
        url: '/api/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        payload: querystring.stringify({
          grant_type: 'password',
          username: 'user@email.com',
          password: 'user_password',
          scope: 'pix-orga'
        })
      };

      // stub dependencies
      sinon.stub(authenticationController, 'authenticateUser').callsFake((request, h) => h.response(useCaseResult));

      // instance new Hapi.js server with minimal config to test route
      server = Hapi.server();

      return server.register(require('../../../../lib/application/authentication'));
    });

    it('should return a response with HTTP status code 200 when route handler (a.k.a. controller) is successful', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a response with HTTP status code 200 even if there is no scope in the request', async () => {
      // given
      options.payload = querystring.stringify({
        grant_type: 'password',
        username: 'user@email.com',
        password: 'user_password'
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a "Bad request error" (400) formatted as JSON API when grant type is not "password"', async () => {
      // given
      options.payload = querystring.stringify({
        grant_type: 'authorization_code',
        username: 'valid@email.com',
        password: 'valid_password'
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal(jsonApiError);
    });

    it('should return a "Bad request error" (400) formatted as JSON API when username is missing', async () => {
      // given
      options.payload = querystring.stringify({
        grant_type: 'password',
        password: 'valid_password'
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal(jsonApiError);
    });

    it('should return a "Bad request error" (400) formatted as JSON API when password is missing', async () => {
      // given
      options.payload = querystring.stringify({
        grant_type: 'password',
        username: 'valid@email.com',
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal(jsonApiError);
    });

    it('should return a "Bad request error" (400) formatted as JSON API when username is not an email', async () => {
      // given
      options.payload = querystring.stringify({
        grant_type: 'authorization_code',
        username: 'a_login_not_an_email',
        password: 'valid_password'
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal(jsonApiError);
    });

    it('should return a JSON API error (415) when request "Content-Type" header is not "application/x-www-form-urlencoded"', () => {
      // given
      options.headers['content-type'] = 'text/html';

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(415);
      });
    });
  });

  describe('POST /revoke', () => {

    let options;

    beforeEach(() => {
      // configure a request (valid by default)
      options = {
        method: 'POST',
        url: '/api/revoke',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        payload: querystring.stringify({
          token: 'jwt.access.token',
          token_type_hint: 'access_token',
        })
      };
    });

    it('should return a response with HTTP status code 200 when route handler (a.k.a. controller) is successful', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a "Bad request error" (400) formatted as JSON API when grant type is not "access_token" nor "refresh_token"', async () => {
      // given
      options.payload = querystring.stringify({
        token: 'jwt.access.token',
        token_type_hint: 'not_standard_token_type',
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal(jsonApiError);
    });

    it('should return a "Bad request error" (400) formatted as JSON API when token is missing', async () => {
      // given
      options.payload = querystring.stringify({
        token_type_hint: 'access_token',
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.parse(response.payload)).to.deep.equal(jsonApiError);
    });

    it('should return a response with HTTP status code 200 even when token type hint is missing', async () => {
      // given
      options.payload = querystring.stringify({
        token: 'jwt.access.token',
      });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a JSON API error (415) when request "Content-Type" header is not "application/x-www-form-urlencoded"', async () => {
      // given
      options.headers['content-type'] = 'text/html';

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(415);
    });
  });

});
