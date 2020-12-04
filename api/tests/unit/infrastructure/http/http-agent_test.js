const { expect, sinon } = require('../../../test-helper');
const axios = require('axios');
const { post } = require('../../../../lib/infrastructure/http/http-agent');

describe('Unit | Infrastructure | http | http-agent', () => {

  describe('#post', () => {

    afterEach(() => {
      axios.post.restore();
    });

    it('should return the response status and success from the http call when successful', async () => {
      // given
      const url = 'someUrl';
      const payload = 'somePayload';
      const headers = { a: 'someHeaderInfo' };
      const axiosResponse = {
        status: 'someStatus',
      };
      sinon.stub(axios, 'post').withArgs(url, payload, { headers }).resolves(axiosResponse);

      // when
      const actualResponse = await post(url, payload, headers);

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: true,
        code: axiosResponse.status,
      });
    });

    it('should return the error\'s response status and success from the http call when failed', async () => {
      // given
      const url = 'someUrl';
      const payload = 'somePayload';
      const headers = { a: 'someHeaderInfo' };
      const axiosError = {
        response: { status: 'someStatus' },
      };
      sinon.stub(axios, 'post').withArgs(url, payload, { headers }).rejects(axiosError);

      // when
      const actualResponse = await post(url, payload, headers);

      // then
      expect(actualResponse).to.deep.equal({
        isSuccessful: false,
        code: axiosError.response.status,
      });
    });
  });
});
