// eslint-disable-next-line no-restricted-modules
const axios = require('axios');
const { performance } = require('perf_hooks');
const { logInfoWithCorrelationIds, logErrorWithCorrelationIds } = require('../monitoring-tools');

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
    logInfoWithCorrelationIds({ message: `Starting POST request to ${url}` });
    const startTime = performance.now();
    try {
      const httpResponse = await axios.post(url, payload, {
        headers,
      });
      const duration = performance.now() - startTime;
      logInfoWithCorrelationIds({ metrics: { duration }, message: `End POST request to ${url} success: ${httpResponse.status}` });

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

      logErrorWithCorrelationIds({ message: `End POST request to ${url} error: ${code} ${data.toString()}` });

      return new HttpResponse({
        code,
        data,
        isSuccessful: false,
      });
    }
  },
  async get({ url, payload, headers }) {
    logInfoWithCorrelationIds({ message: `Starting GET request to ${url}` });
    const startTime = performance.now();
    try {
      const config = { data: payload, headers };
      const httpResponse = await axios.get(url, config);
      const duration = performance.now() - startTime;
      logInfoWithCorrelationIds({ metrics: { duration }, message: `End GET request to ${url} success: ${httpResponse.status}` });

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

      logErrorWithCorrelationIds(`End GET request to ${url} error: ${code}`);

      return new HttpResponse({
        code,
        data,
        isSuccessful,
      });
    }
  },
};
