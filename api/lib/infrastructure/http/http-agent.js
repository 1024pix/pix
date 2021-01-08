const axios = require('axios');

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
  async post(url, payload, headers) {
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
      return new HttpResponse({
        code: httpErr.response.status,
        data: httpErr.response.data,
        isSuccessful: false,
      });
    }
  },
};
