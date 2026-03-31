import perf_hooks from 'node:perf_hooks';

import axios from 'axios';

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
  async post({ url, payload, headers }) {
    const startTime = performance.now();
    let responseTime = null;
    try {
      const finalHeaders = structuredClone(headers);
      finalHeaders['Content-type'] = 'application/json';
      const httpResponse = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: finalHeaders,
      });
      responseTime = performance.now() - startTime;
      if (!httpResponse.ok) {
        const data = await _parseResponseBody(httpResponse);
        const code = httpResponse.status;
        const message = `End POST request to ${url} error: ${code || ''} ${JSON.stringify(data)}`;

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
        message: `End POST request to ${url} success: ${httpResponse.status}`,
      });
      const data = await _parseResponseBody(httpResponse);

      return new HttpResponse({
        code: httpResponse.status,
        data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      responseTime = performance.now() - startTime;
      const message = `End POST request to ${url} , unexpected error: ${httpErr.message}`;
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
  },

  async get({ url, payload, headers, timeout }) {
    const startTime = performance.now();
    let responseTime = null;
    try {
      const config = {
        data: payload,
        headers,
      };
      if (timeout != undefined) {
        config.timeout = timeout;
      }
      const httpResponse = await axios.get(url, config);
      responseTime = performance.now() - startTime;
      logger.info({
        metrics: { responseTime },
        message: `End GET request to ${url} success: ${httpResponse.status}`,
      });

      return new HttpResponse({
        code: httpResponse.status,
        data: httpResponse.data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      responseTime = performance.now() - startTime;
      const isSuccessful = false;

      let code;
      let data;

      if (httpErr.response) {
        code = httpErr.response.status;
        data = httpErr.response.data;
      } else {
        code = httpErr.code;
        data = httpErr.message;
      }

      logger.error({
        metrics: { responseTime },
        message: `End GET request to ${url} error: ${code || ''} ${JSON.stringify(data)}`,
      });

      return new HttpResponse({
        code,
        data,
        isSuccessful,
      });
    }
  },
};

async function _parseResponseBody(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export { httpAgent };
