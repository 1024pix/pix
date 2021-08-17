const _ = require('lodash');
const moment = require('moment');
const constants = require('../constants');

class SharedProfileForCampaign {
  constructor({
    id,
    sharedAt,
    campaignAllowsRetry,
    isRegistrationActive,
    scorecards = [],
  }) {
    this.id = id;
    this.sharedAt = sharedAt;
    this.scorecards = scorecards;
    this.pixScore = _.sumBy(this.scorecards, 'earnedPix') || 0;
    this.canRetry = this._computeCanRetry(campaignAllowsRetry, sharedAt, isRegistrationActive);
  }

  _computeCanRetry(campaignAllowsRetry, sharedAt, isRegistrationActive) {
    return campaignAllowsRetry
      && this._timeBeforeRetryingPassed(sharedAt)
      && isRegistrationActive;
  }

  _timeBeforeRetryingPassed(sharedAt) {
    if (!sharedAt) return false;
    return sharedAt && moment().diff(sharedAt, 'days', true) >= constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING;
  }
}

module.exports = SharedProfileForCampaign;
