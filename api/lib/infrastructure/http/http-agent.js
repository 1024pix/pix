// eslint-disable-next-line no-restricted-modules
const axios = require('axios');
const { logInfoWithCorrelationId, logErrorWithCorrelationId } = require('../../infrastructure/performance-tools');

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
    logInfoWithCorrelationId(`Starting POST request to ${url}`);

    try {
      const httpResponse = await axios.post(url, payload, {
        headers,
      });

      logInfoWithCorrelationId(`End POST request to ${url} success: ${httpResponse.status}`);

      return new HttpResponse({
        code: httpResponse.status,
        data: httpResponse.data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      let code = null;
      let data;

      if (httpErr.response) {
        code = httpErr.response.status;
        data = httpErr.response.data;
      } else {
        data = httpErr.message;
      }

      logErrorWithCorrelationId(`End POST request to ${url} error: ${code} ${data.toString()}`);

      return new HttpResponse({
        code,
        data,
        isSuccessful: false,
      });
    }
  },
  async get({ url, payload, headers }) {
    logInfoWithCorrelationId(`Starting GET request to ${url}`);

    try {
      const config = { data: payload, headers };
      const httpResponse = await axios.get(url, config);

      logInfoWithCorrelationId(`End GET request to ${url} success: ${httpResponse.status}`);

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

      logInfoWithCorrelationId(`End GET request to ${url} error: ${code}`);

      return new HttpResponse({
        code,
        data,
        isSuccessful,
      });
    }
  },
};
