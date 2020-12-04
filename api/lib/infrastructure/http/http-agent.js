const axios = require('axios');

module.exports = {
  async post(url, payload, headers) {
    const response = {
      isSuccessful: false,
      code: null,
    };
    try {
      const httpResponse = await axios.post(url, payload, {
        headers,
      });
      response.isSuccessful = true;
      response.code = httpResponse.status;
    } catch (httpErr) {
      response.code = httpErr.response.status;
    }

    return response;
  },
};
