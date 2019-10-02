const { NotFoundError } = require('../../domain/errors');

module.exports = async function getCampaignByCode({
  code,
  campaignRepository,
}) {
  const foundCampaign = await campaignRepository.getByCode(code);
  if (foundCampaign === null) {
    return Promise.reject(new NotFoundError(`Campaign with code ${code} not found`));
  }
  return foundCampaign;
};
