import querystring from 'node:querystring';

import sinon from 'sinon';

import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import { tokenController } from '../../../../src/identity-access-management/application/token/token.controller.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Integration | Identity Access Management | Application | Route | Token', function () {
  let httpTestServer;
  let headers;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(identityAccessManagementRoutes);

    headers = {
      'content-type': 'application/x-www-form-urlencoded',
    };

    sinon.stub(tokenController, 'createToken').callsFake((request, h) =>
      h.response({
        token_type: 'bearer',
        access_token: 'some-jwt-access-token',
        user_id: 'the-user-id',
      }),
    );
  });

  describe('POST /api/token', function () {
    const method = 'POST';
    const url = '/api/token';

    context('when grant_type is missing', function () {
      it('returns a 400 HTTP status code', async function () {
        // given
        const payload = querystring.stringify({
          username: 'valid@email.com',
          password: 'valid_password',
        });

        // when
        const response = await httpTestServer.requestObject({ method, url, payload, auth: null, headers });

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when grant_type is neither "password" nor "refresh_token"', function () {
      it('returns a 400 HTTP status code', async function () {
        // given
        const payload = querystring.stringify({
          grant_type: 'invalidGrantType',
          username: 'valid@email.com',
          password: 'valid_password',
        });

        // when
        const response = await httpTestServer.requestObject({ method, url, payload, auth: null, headers });

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when grant_type is "password"', function () {
      context('when username is missing', function () {
        it('returns a 400 HTTP status code', async function () {
          // given
          const payload = querystring.stringify({
            grant_type: 'password',
            password: 'valid_password',
          });

          // when
          const response = await httpTestServer.requestObject({ method, url, payload, auth: null, headers });

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when password is missing', function () {
        it('returns a 400 HTTP status code', async function () {
          // given
          const payload = querystring.stringify({
            grant_type: 'password',
            username: 'valid@email.com',
          });

          // when
          const response = await httpTestServer.requestObject({ method, url, payload, auth: null, headers });

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when "Content-Type" header is not "application/x-www-form-urlencoded"', function () {
        it('returns a 415 HTTP status code', async function () {
          // given
          const headers = {
            'content-type': 'text/html',
          };

          const payload = querystring.stringify({
            grant_type: 'password',
            username: 'user.username2453  ',
            password: 'user_password',
            scope: 'pix-orga',
          });

          // when
          const response = await httpTestServer.requestObject({ method, url, payload, auth: null, headers });

          // then
          expect(response.statusCode).to.equal(415);
        });
      });

      context('when there is no scope', function () {
        it('returns a 200 HTTP status code', async function () {
          // given
          const payload = querystring.stringify({
            grant_type: 'password',
            username: 'user@email.com',
            password: 'user_password',
          });

          // when
          const response = await httpTestServer.requestObject({ method, url, payload, auth: null, headers });

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });
});
