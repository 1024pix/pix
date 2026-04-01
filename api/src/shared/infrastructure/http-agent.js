import perf_hooks from 'node:perf_hooks';

const { performance } = perf_hooks;

import { logger } from './utils/logger.js';

class HttpResponse {
  constructor({ code, data, isSuccessful }) {
    this.code = code;
    this.data = data;
    this.isSuccessful = isSuccessful;
  }
}

const httpAgent = {
  /**
   * Sends a POST request with a JSON payload.
   * @param {Object} options
   * @param {string} options.url
   * @param {Object} options.payload
   * @param {Object} [options.headers]
   * @returns {Promise<HttpResponse>}
   */
  async post({ url, payload, headers }) {
    const finalHeaders = structuredClone(headers ?? {});
    finalHeaders['Content-type'] = 'application/json';
    const body = payload && JSON.stringify(payload);
    return _doRequest({ url, headers: finalHeaders, body, method: 'POST' });
  },

  /**
   * Sends a GET request to the specified URL.
   * @param {Object} options
   * @param {string} options.url
   * @param {Object} [options.headers]
   * @returns {Promise<HttpResponse>}
   */
  async get({ url, headers }) {
    return _doRequest({ url, headers, method: 'GET' });
  },
};

async function _doRequest({ url, body, headers, method }) {
  const startTime = performance.now();
  let responseTime;
  try {
    const httpResponse = await fetch(url, {
      method,
      body,
      headers,
    });
    responseTime = performance.now() - startTime;
    if (!httpResponse.ok) {
      const data = await _parseResponseBody(httpResponse);
      const code = httpResponse.status;
      const message = `End ${method} request to ${url} error: ${code || ''} ${JSON.stringify(data)}`;

      logger.error({
        metrics: { responseTime },
        message,
      });

      return new HttpResponse({
        code,
        data,
        isSuccessful: false,
      });
    }

    logger.info({
      metrics: { responseTime },
      message: `End ${method} request to ${url} success: ${httpResponse.status}`,
    });
    const data = await _parseResponseBody(httpResponse);

    return new HttpResponse({
      code: httpResponse.status,
      data,
      isSuccessful: true,
    });
  } catch (httpErr) {
    responseTime = performance.now() - startTime;
    const message = `End ${method} request to ${url} , unexpected error: ${httpErr.message}`;
    logger.error({
      metrics: { responseTime },
      message,
    });

    return new HttpResponse({
      code: null,
      data: httpErr.message,
      isSuccessful: false,
    });
  }
}

// Deliberately not checking headers for content-type to determine
// whether to use response.json() or not
// to mimic how axios handles it (axios is much more agressive and does not read the headers)
// ref: https://github.com/axios/axios/blob/v1.x/lib/defaults/index.js  fnc: stringifySafely
async function _parseResponseBody(response) {
  const rawData = await response.text();
  try {
    return JSON.parse(rawData);
  } catch {
    return rawData;
  }
}

export { httpAgent };
