const _ = require('lodash');

class SharedProfileForCampaign {
  constructor({
    id,
    sharedAt,
    scorecards = [],
  }) {
    this.id = id;
    this.sharedAt = sharedAt;
    this.scorecards = scorecards;
    this.pixScore = _.sumBy(this.scorecards, 'earnedPix') || 0;
  }
}

module.exports = SharedProfileForCampaign;
