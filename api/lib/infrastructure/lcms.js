const httpAgent = require('./http/http-agent');

const { lcms } = require('../config');

module.exports = {
  async getLatestRelease() {
    const response = await httpAgent.get({
      url: lcms.url + '/releases/latest',
      headers: { Authorization: `Bearer ${lcms.apiKey}` },
    });

    if (!response.isSuccessful) {
      throw new Error(`An error occurred while fetching ${lcms.url}`);
    }

    return response.data.content;
  },

  async createRelease() {
    const response = await httpAgent.post({
      url: lcms.url + '/releases',
      headers: { Authorization: `Bearer ${lcms.apiKey}` },
    });
    return response.data.content;
  },
};
