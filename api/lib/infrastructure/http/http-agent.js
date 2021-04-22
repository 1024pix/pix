// eslint-disable-next-line no-restricted-modules
const axios = require('axios');
const logger = require('../logger');

class HttpResponse {
  constructor({
    code,
    data,
    isSuccessful,
  }) {
    this.code = code;
    this.data = data;
    this.isSuccessful = isSuccessful;
  }
}

module.exports = {
  async post({ url, payload, headers }) {
    try {
      const httpResponse = await axios.post(url, payload, {
        headers,
      });
      return new HttpResponse({
        code: httpResponse.status,
        data: httpResponse.data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      const isSuccessful = false;

      let code;
      let data;

      if (httpErr.response) {
        code = httpErr.response.status;
        data = httpErr.response.data;
      } else {
        code = '500';
        data = null;
      }

      logger.error({ err: httpErr }, `Error while post ${url}`);
      return new HttpResponse({
        code,
        data,
        isSuccessful,
      });
    }
  },
  async get({ url, payload, headers }) {
    try {
      const config = { data: payload, headers };
      const httpResponse = await axios.get(url, config);
      return new HttpResponse({
        code: httpResponse.status,
        data: httpResponse.data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      const isSuccessful = false;

      let code;
      let data;

      if (httpErr.response) {
        code = httpErr.response.status;
        data = httpErr.response.data;
      } else {
        code = '500';
        data = null;
      }

      return new HttpResponse({
        code,
        data,
        isSuccessful,
      });
    }
  },
};
