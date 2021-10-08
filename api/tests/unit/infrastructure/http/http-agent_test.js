const { expect, sinon } = require('../../../test-helper');
const axios = require('axios');
const logger = require('../../../../lib/infrastructure/logger');
const { post, get } = require('../../../../lib/infrastructure/http/http-agent');

describe('Unit | Infrastructure | http | http-agent', function () {
  describe('#post', function () {
    afterEach(function () {
      axios.post.restore();
    });

    it('should return the response status and success from the http call when successful', async function () {
      // given
      const url = 'someUrl';
      const payload = 'somePayload';
      const headers = { a: 'someHeaderInfo' };
      const axiosResponse = {
        data: Symbol('data'),
        status: 'someStatus',
      };
      sinon.stub(axios, 'post').withArgs(url, payload, { headers }).resolves(axiosResponse);

      // when
      const actualResponse = await post({ url, payload, headers });

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: true,
        code: axiosResponse.status,
        data: axiosResponse.data,
      });
    });

    context('when an error occurs', function () {
      context('when error.response exists', function () {
        it("should return the error's response status and data from the http call when failed", async function () {
          // given
          sinon.stub(logger, 'error');

          const url = 'someUrl';
          const payload = 'somePayload';
          const headers = { a: 'someHeaderInfo' };
          const axiosError = {
            response: {
              data: Symbol('data'),
              status: 'someStatus',
            },
          };
          sinon.stub(axios, 'post').withArgs(url, payload, { headers }).rejects(axiosError);

          // when
          const actualResponse = await post({ url, payload, headers });

          // then
          expect(actualResponse).to.deep.equal({
            isSuccessful: false,
            code: axiosError.response.status,
            data: axiosError.response.data,
          });
        });
      });

      context("when error.response doesn't exists", function () {
        it("should log error and return the error's response status and success from the http call when failed", async function () {
          // given
          sinon.stub(logger, 'error');

          const url = 'someUrl';
          const payload = 'somePayload';
          const headers = { a: 'someHeaderInfo' };

          const axiosError = {
            response: {
              data: { error: 'HTTP error' },
              status: 400,
            },
          };
          sinon.stub(axios, 'post').withArgs(url, payload, { headers }).rejects(axiosError);

          const expectedResponse = {
            isSuccessful: false,
            code: axiosError.response.status,
            data: axiosError.response.data,
          };

          // when
          const actualResponse = await post({ url, payload, headers });

          // then
          expect(actualResponse).to.deep.equal(expectedResponse);
        });
      });
    });
  });
  describe('#get', function () {
    afterEach(function () {
      axios.get.restore();
    });

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
      context('when error.response exists', function () {
        it("should return the error's response status and data from the http call when failed", async function () {
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
        it("should return the error's response status and success from the http call when failed", async function () {
          // given
          const url = 'someUrl';
          const payload = 'somePayload';
          const headers = { a: 'someHeaderInfo' };

          const axiosError = {
            name: 'error name',
          };
          sinon.stub(axios, 'get').withArgs(url, { data: payload, headers }).rejects(axiosError);

          const expectedResponse = {
            isSuccessful: false,
            code: '500',
            data: null,
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
