import nock from 'nock';

import { httpAgent } from '../../../../src/shared/infrastructure/http-agent.js';
import { expect } from '../../../test-helper.js';

const { post, get } = httpAgent;

describe('Shared | Integration | Infrastructure | http-agent', function () {
  describe('#post', function () {
    it('should return the response status and success from the http call when successful', async function () {
      // given
      const response = { coucou: 'cava' };
      const payload = { foo: 'bar' };
      const headers = { Authorization: 'Bearer monsupertoken' };
      const requestScope = nock('https://my-url.com', {
        reqheaders: { 'content-type': 'application/json', ...headers },
      })
        .post('/someresource', payload)
        .reply(201, JSON.stringify(response));

      // when
      const actualResponse = await post({ url: 'https://my-url.com/someresource', payload, headers });

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: true,
        code: 201,
        data: response,
      });
      expect(requestScope.isDone()).to.be.true;
    });

    context('when an error occurs', function () {
      context('when fetch succeed but response is not 2xx', function () {
        it("should return an http response with the error's response status as code and data from the failed http call", async function () {
          // given
          const response = { error: 'cavapas' };
          const payload = { foo: 'bar' };
          const headers = { Authorization: 'Bearer monsupertoken' };
          const requestScope = nock('https://my-url.com', {
            reqheaders: { 'content-type': 'application/json', ...headers },
          })
            .post('/someresource', payload)
            .reply(429, response);

          // when
          const actualResponse = await post({ url: 'https://my-url.com/someresource', payload, headers });

          // then
          expect(actualResponse).to.deep.equal({
            isSuccessful: false,
            code: 429,
            data: response,
          });
          expect(requestScope.isDone()).to.be.true;
        });
      });

      context('when fetch fails', function () {
        it('should return an http response containing the error message', async function () {
          // given
          const payload = { foo: 'bar' };
          const headers = { Authorization: 'Bearer monsupertoken' };
          const requestScope = nock('https://my-url.com', {
            reqheaders: { 'content-type': 'application/json', ...headers },
          })
            .post('/someresource', payload)
            .replyWithError('some network error occurred');

          // when
          const actualResponse = await post({ url: 'https://my-url.com/someresource', payload, headers });

          // then
          expect(actualResponse).to.deep.equal({
            isSuccessful: false,
            code: null,
            data: 'some network error occurred',
          });
          expect(requestScope.isDone()).to.be.true;
        });
      });
    });
  });

  describe('#get', function () {
    it('should return the response status and success from the http call when successful', async function () {
      // given
      const response = { coucou: 'cava' };
      const headers = { Authorization: 'Bearer monsupertoken' };
      const requestScope = nock('https://my-url.com', {
        reqheaders: headers,
      })
        .get('/someresource')
        .reply(200, JSON.stringify(response));

      // when
      const actualResponse = await get({ url: 'https://my-url.com/someresource', headers });

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: true,
        code: 200,
        data: response,
      });
      expect(requestScope.isDone()).to.be.true;
    });

    context('when an error occurs', function () {
      context('when fetch succeed but response is not 2xx', function () {
        it("should return an http response with the error's response status as code and data from the failed http call", async function () {
          // given
          const response = { error: 'cavapas' };
          const headers = { Authorization: 'Bearer monsupertoken' };
          const requestScope = nock('https://my-url.com', {
            reqheaders: headers,
          })
            .get('/someresource')
            .reply(429, response);

          // when
          const actualResponse = await get({ url: 'https://my-url.com/someresource', headers });

          // then
          expect(actualResponse).to.deep.equal({
            isSuccessful: false,
            code: 429,
            data: response,
          });
          expect(requestScope.isDone()).to.be.true;
        });
      });

      context('when fetch fails', function () {
        it('should return an http response containing the error message', async function () {
          // given
          const headers = { Authorization: 'Bearer monsupertoken' };
          const requestScope = nock('https://my-url.com', {
            reqheaders: headers,
          })
            .get('/someresource')
            .replyWithError('some network error occurred');

          // when
          const actualResponse = await get({ url: 'https://my-url.com/someresource', headers });

          // then
          expect(actualResponse).to.deep.equal({
            isSuccessful: false,
            code: null,
            data: 'some network error occurred',
          });
          expect(requestScope.isDone()).to.be.true;
        });
      });
    });
  });
});
