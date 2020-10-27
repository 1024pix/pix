const BookshelfStage = require('../../infrastructure/data/stage');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {
  async getByCampaignId(campaignId) {
    const results = await BookshelfStage.query((qb) => {
      qb.join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId');
      qb.where('campaigns.id', '=', campaignId);
      qb.orderBy('stages.threshold', 'ASC');
    }).fetchAll({ require: false });

    return results.map((result) => bookshelfToDomainConverter.buildDomainObject(BookshelfStage, result));
  },
};
