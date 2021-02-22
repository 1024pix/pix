const axios = require('axios');
const { lcms } = require('../config');

module.exports = {
  async getCurrentContent() {
    const response = await axios.get('/releases/latest', {
      baseURL: lcms.url,
      headers: { Authorization: `Bearer ${lcms.apiKey}` },
    });
    return response.data.content;
  },
};
