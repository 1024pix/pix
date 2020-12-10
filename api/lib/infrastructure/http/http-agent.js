const axios = require('axios');

class HttpResponse {
  constructor({
    code,
    isSuccessful,
  }) {
    this.code = code;
    this.isSuccessful = isSuccessful;
  }
}

module.exports = {
  async post(url, payload, headers) {
    try {
      const httpResponse = await axios.post(url, payload, {
        headers,
      });
      return new HttpResponse({
        code: httpResponse.status,
        isSuccessful: true,
      });
    } catch (httpErr) {
      return new HttpResponse({
        code: httpErr.response.status,
        isSuccessful: false,
      });
    }
  },
};
