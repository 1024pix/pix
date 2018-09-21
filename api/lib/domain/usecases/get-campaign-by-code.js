const { NotFoundError } = require('../../domain/errors');

module.exports = function getCampaignByCode({ code, campaignRepository }) {
  return campaignRepository.getByCode(code)
    .then((campaign) => {
      if(campaign === null) {
        return Promise.reject(new NotFoundError(`Not found campaign with code ${code}`));
      }
      return campaign;
    });
};
