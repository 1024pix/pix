import axios from 'axios';
import nock from 'nock';
import sinon from 'sinon';

import { httpAgent } from '../../../../src/shared/infrastructure/http-agent.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
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
        .reply(201, JSON.stringify(response), {
          'Content-Type': 'application/json',
        });

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
      const url = 'someUrl';
      const payload = 'somePayload';
      const headers = { a: 'someHeaderInfo' };
      const axiosResponse = {
        data: Symbol('data'),
        status: 'someStatus',
      };
      sinon.stub(axios, 'get').withArgs(url, { data: payload, headers }).resolves(axiosResponse);

      // when
      const actualResponse = await get({ url, payload, headers });

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: true,
        code: axiosResponse.status,
        data: axiosResponse.data,
      });
    });

    context('when an error occurs', function () {
      it('should log the response error data and response time', async function () {
        // given
        sinon.stub(logger, 'error');
        logger.error.resolves();

        const url = 'someUrl';
        const payload = 'somePayload';
        const headers = { a: 'someHeaderInfo' };
        const axiosError = {
          response: {
            data: { a: '1', b: '2' },
            status: 400,
          },
        };
        sinon.stub(axios, 'get').withArgs(url, { data: payload, headers }).rejects(axiosError);

        // when
        await get({ url, payload, headers });

        // then
        const expected = 'End GET request to someUrl error: 400 {"a":"1","b":"2"}';
        const { message, metrics } = logger.error.firstCall.args[0];
        expect(message).to.equal(expected);
        expect(metrics.responseTime).to.be.greaterThan(0);
      });

      context('when error.response exists', function () {
        it("should return an http response with the error's response status as code and data from the failed http call", async function () {
          // given
          const url = 'someUrl';
          const payload = 'somePayload';
          const headers = { a: 'someHeaderInfo' };
          const axiosError = {
            response: {
              data: Symbol('data'),
              status: 'someStatus',
            },
          };
          sinon.stub(axios, 'get').withArgs(url, { data: payload, headers }).rejects(axiosError);

          // when
          const actualResponse = await get({ url, payload, headers });

          // then
          expect(actualResponse).to.deep.equal({
            isSuccessful: false,
            code: axiosError.response.status,
            data: axiosError.response.data,
          });
        });
      });

      context("when error.response doesn't exists", function () {
        it('should return an http response with error with code 500 and data null', async function () {
          // given
          const url = 'someUrl';
          const payload = 'somePayload';
          const headers = { a: 'someHeaderInfo' };

          const axiosError = {
            name: 'error name',
            message: 'MESSAGE_ERROR',
            code: 'CODE_ERROR',
          };
          sinon.stub(axios, 'get').withArgs(url, { data: payload, headers }).rejects(axiosError);

          const expectedResponse = {
            isSuccessful: false,
            code: 'CODE_ERROR',
            data: 'MESSAGE_ERROR',
          };

          // when
          const actualResponse = await get({ url, payload, headers });

          // then
          expect(actualResponse).to.deep.equal(expectedResponse);
        });
      });
    });
  });
});
