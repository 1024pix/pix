import jsonwebtoken from 'jsonwebtoken';

import { ApiData } from '../../../../src/shared/infrastructure/datasources/ApiData.js';
import { expect, nock } from '../../../test-helper.js';

describe('Unit | Infrastructure | Datasources | ApiData', function () {
  describe('#getToken', function () {
    context('when they are no token', function () {
      it('should fetch a token and return it', async function () {
        const apiDataCredentials = { user: 'user', password: 'password' };
        const apiDataUrl = 'http://example.net';
        const apiData = new ApiData(apiDataUrl, apiDataCredentials);

        const fetchTokenMock = nock(apiDataUrl)
          .post('/token', apiDataCredentials)
          .reply(200, { test: 'test', data: { access_token: 'returned-token' } });

        const token = await apiData.getToken();

        expect(fetchTokenMock.isDone()).to.be.true;
        expect(token).to.equal('returned-token');
      });
    });

    context('when the token is expired', function () {
      it('should fetch a new token and return it', async function () {
        const apiDataCredentials = { user: 'user', password: 'password' };
        const apiDataUrl = 'http://example.net';
        const apiData = new ApiData(apiDataUrl, apiDataCredentials);

        const invalidToken = jsonwebtoken.sign({}, 'test-secret', { expiresIn: '1sec' });
        apiData.token = invalidToken;

        const fetchTokenMock = nock(apiDataUrl)
          .post('/token', apiDataCredentials)
          .reply(200, { test: 'test', data: { access_token: 'returned-token' } });

        // when
        setTimeout(async () => {
          return;
        }, 100);

        const token = await apiData.getToken();

        expect(fetchTokenMock.isDone()).to.be.true;
        expect(token).to.equal('returned-token');
      });
    });

    context('when the token is not expired', function () {
      it('should return the token', async function () {
        const apiDataCredentials = { user: 'user', password: 'password' };
        const apiDataUrl = 'http://example.net';
        const apiData = new ApiData(apiDataUrl, apiDataCredentials);

        const validToken = jsonwebtoken.sign({}, 'test-secret', { expiresIn: '30d' });
        apiData.token = validToken;

        const fetchTokenMock = nock(apiDataUrl)
          .post('/token', apiDataCredentials)
          .reply(200, { test: 'test', data: { access_token: 'returned-token' } });

        // when
        const token = await apiData.getToken();

        // then
        expect(fetchTokenMock.isDone()).to.be.false;
        expect(token).to.equal(validToken);
      });
    });
  });

  describe('#get', function () {
    it('should use the token to fetch data', async function () {
      // given
      const apiDataCredentials = { user: 'user', password: 'password' };
      const apiDataUrl = 'http://example.net';

      const apiData = new ApiData(apiDataUrl, apiDataCredentials);

      const validToken = jsonwebtoken.sign({}, 'test-secret', { expiresIn: '30d' });
      apiData.token = validToken;

      const queryId = 'queryId';
      const params = [{ param: 'value' }];

      const expectedData = [{ result: 'result' }];
      const fetchMock = nock(apiDataUrl)
        .post('/query', { queryId, params })
        .matchHeader('Content-Type', 'application/json')
        .matchHeader('Authorization', `Bearer ${validToken}`)
        .reply(200, { status: 'success', data: expectedData });

      // when
      const result = await apiData.get(queryId, params);

      // then
      expect(fetchMock.isDone()).to.be.true;
      expect(result.data).to.deep.equal(expectedData);
    });
  });
});
