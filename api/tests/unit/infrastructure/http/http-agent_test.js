import { expect, sinon } from '../../../test-helper';
import axios from 'axios';
import { post, get } from '../../../../lib/infrastructure/http/http-agent';
import monitoringTools from '../../../../lib/infrastructure/monitoring-tools';

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
      const timeout = 'someTimeout';
      sinon
        .stub(axios, 'post')
        .withArgs(url, payload, {
          headers,
          timeout,
        })
        .resolves(axiosResponse);

      // when
      const actualResponse = await post({ url, payload, headers, timeout });

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
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        monitoringTools.logErrorWithCorrelationIds.resolves();

        const url = 'someUrl';
        const payload = 'somePayload';
        const headers = { a: 'someHeaderInfo' };
        const axiosError = {
          response: {
            data: { a: '1', b: '2' },
            status: 400,
          },
        };
        sinon.stub(axios, 'post').withArgs(url, payload, { headers }).rejects(axiosError);

        // when
        await post({ url, payload, headers });

        // then
        const expected = 'End POST request to someUrl error: 400 {"a":"1","b":"2"}';
        const { message, metrics } = monitoringTools.logErrorWithCorrelationIds.firstCall.args[0];
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
        it('should return an http response with error with code 500 and data null', async function () {
          // given
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
      it('should log the response error data and response time', async function () {
        // given
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        monitoringTools.logErrorWithCorrelationIds.resolves();

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
        const { message, metrics } = monitoringTools.logErrorWithCorrelationIds.firstCall.args[0];
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
