import perf_hooks from 'node:perf_hooks';

const { performance } = perf_hooks;

import { monitoringTools } from '../monitoring-tools.js';

class HttpResponse {
  constructor({ code, data, isSuccessful }) {
    this.code = code;
    this.data = data;
    this.isSuccessful = isSuccessful;
  }
}

const httpAgent = {
  async post({ url, payload, headers, timeout }) {
    const startTime = performance.now();
    let responseTime = null;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        signal: timeout ? new AbortController().signal : undefined, // Timeout handling is different in Fetch
      });
      responseTime = performance.now() - startTime;
      const data = await response.json();
      if (!response.ok) throw { response };

      monitoringTools.logInfoWithCorrelationIds({
        metrics: { responseTime },
        message: `End POST request to ${url} success: ${response.status}`,
      });

      return new HttpResponse({
        code: response.status,
        data: data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      responseTime = performance.now() - startTime;
      const code = httpErr.response ? httpErr.response.status : 'Network Error';
      const data = httpErr.response ? await httpErr.response.json() : httpErr.message;

      monitoringTools.logErrorWithCorrelationIds({
        metrics: { responseTime },
        message: `End POST request to ${url} error: ${code} ${JSON.stringify(data)}`,
      });

      return new HttpResponse({
        code,
        data,
        isSuccessful: false,
      });
    }
  },
  async get({ url, headers, timeout }) {
    const startTime = performance.now();
    let responseTime = null;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        signal: timeout ? new AbortController().signal : undefined, // Timeout handling is different in Fetch
      });
      responseTime = performance.now() - startTime;
      const data = await response.json();
      if (!response.ok) throw { response };

      monitoringTools.logInfoWithCorrelationIds({
        metrics: { responseTime },
        message: `End GET request to ${url} success: ${response.status}`,
      });

      return new HttpResponse({
        code: response.status,
        data: data,
        isSuccessful: true,
      });
    } catch (httpErr) {
      responseTime = performance.now() - startTime;
      const code = httpErr.response ? httpErr.response.status : 'Network Error';
      const data = httpErr.response ? await httpErr.response.json() : null;

      monitoringTools.logErrorWithCorrelationIds({
        metrics: { responseTime },
        message: `End GET request to ${url} error: ${code} ${JSON.stringify(data)}`,
      });

      return new HttpResponse({
        code,
        data,
        isSuccessful: false,
      });
    }
  },
};

export { httpAgent };
