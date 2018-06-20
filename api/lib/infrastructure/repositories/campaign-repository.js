const Campaign = require('../data/campaign');

module.exports = {

  isCodeAvailable(code) {
    return Campaign
      .where({ code })
      .fetch()
      .then(campaign => {
        if (campaign) {
          return Promise.resolve(false);
        }

        return Promise.resolve(true);
      });
  }

};
