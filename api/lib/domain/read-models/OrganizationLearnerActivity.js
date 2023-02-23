const CampaignTypes = require('../models/CampaignTypes.js');
const countBy = require('lodash/countBy');

class OrganizationLearnerActivity {
  constructor({ organizationLearnerId, participations }) {
    this.organizationLearnerId = organizationLearnerId;
    this.participations = participations;
    this.statistics = _statistics(participations);
  }
}

function _getStatisticsForType(participations, campaignType) {
  const participationsForCampaignType = participations.filter(
    (participation) => participation.campaignType === campaignType
  );

  const { SHARED = 0, TO_SHARE = 0, STARTED = 0 } = countBy(participationsForCampaignType, 'status');

  const statisticForCampaignType = {
    campaignType,
    shared: SHARED,
    to_share: TO_SHARE,
    total: participationsForCampaignType.length,
  };

  if (campaignType === CampaignTypes.ASSESSMENT) {
    return {
      ...statisticForCampaignType,
      started: STARTED,
    };
  }
  return statisticForCampaignType;
}

function _statistics(participations) {
  return Object.values(CampaignTypes).map((campaignType) => _getStatisticsForType(participations, campaignType));
}

module.exports = OrganizationLearnerActivity;
