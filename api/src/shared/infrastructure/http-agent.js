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

  async get({ url, headers }) {
    const startTime = performance.now();
    let responseTime = null;
    try {
      const httpResponse = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      responseTime = performance.now() - startTime;
      if (!httpResponse.ok) {
        const data = await _parseResponseBody(httpResponse);
        const code = httpResponse.status;
        const message = `End GET request to ${url} error: ${code || ''} ${JSON.stringify(data)}`;

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
        message: `End GET request to ${url} success: ${httpResponse.status}`,
      });
      const data = await _parseResponseBody(httpResponse);

      return new HttpResponse({
        code: httpResponse.status,
        data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      responseTime = performance.now() - startTime;
      const message = `End GET request to ${url} , unexpected error: ${httpErr.message}`;
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
};

async function _parseResponseBody(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export { httpAgent };
