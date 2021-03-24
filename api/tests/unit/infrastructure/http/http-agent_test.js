const { expect, sinon } = require('../../../test-helper');
const axios = require('axios');
const { post } = require('../../../../lib/infrastructure/http/http-agent');

describe('Unit | Infrastructure | http | http-agent', function() {

  describe('#post', function() {

    afterEach(function() {
      axios.post.restore();
    });

    it('should return the response status and success from the http call when successful', async function() {
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
      const actualResponse = await post(url, payload, headers);

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: true,
        code: axiosResponse.status,
        data: axiosResponse.data,
      });
    });

    it('should return the error\'s response status and success from the http call when failed', async function() {
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
      const actualResponse = await post(url, payload, headers);

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: false,
        code: axiosError.response.status,
        data: axiosError.response.data,
      });
    });
  });
});
