const campaignCodeGenerator = require('../services/campaigns/campaign-code-generator');
const campaignValidator = require('../../domain/validators/campaign-validator');
const Campaign = require('../models/Campaign');

module.exports = function({ campaign, campaignRepository }) {

  return campaignValidator.validate(campaign)
    .then(() => campaignCodeGenerator.generate(campaignRepository))
    .then((generatedCampaignCode) => {
      const campaignWithCode = new Campaign(campaign);
      campaignWithCode.code = generatedCampaignCode;
      return campaignWithCode;
    })
    .then(campaignRepository.save);
};
