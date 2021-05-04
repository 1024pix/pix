const httpAgent = require('./http/http-agent');

const { lcms } = require('../config');

module.exports = {
  async getCurrentContent() {
    const response = await httpAgent.get(
      {
        url: lcms.url + '/releases/latest',
        headers: { Authorization: `Bearer ${lcms.apiKey}` },
      },
    );
    return response.data.content;
  },

  async createRelease() {
  },

};
