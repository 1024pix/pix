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
    const finalHeaders = structuredClone(headers);
    finalHeaders['Content-type'] = 'application/json';
    return _doRequest({ url, headers: finalHeaders, payload, method: 'POST' });
  },

  async get({ url, headers }) {
    return _doRequest({ url, headers, method: 'GET' });
  },
};

async function _doRequest({ url, payload, headers, method }) {
  const startTime = performance.now();
  let responseTime = null;
  const body = payload ? JSON.stringify(payload) : undefined;
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

async function _parseResponseBody(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export { httpAgent };
