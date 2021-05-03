const _ = require('lodash');
const moment = require('moment');
const constants = require('../constants');

class SharedProfileForCampaign {
  constructor({
    id,
    sharedAt,
    campaignAllowsRetry,
    scorecards = [],
  }) {
    this.id = id;
    this.sharedAt = sharedAt;
    this.scorecards = scorecards;
    this.pixScore = _.sumBy(this.scorecards, 'earnedPix') || 0;
    this.canRetry = campaignAllowsRetry && moment().diff(this.sharedAt, 'days', true) >= constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

module.exports = SharedProfileForCampaign;
