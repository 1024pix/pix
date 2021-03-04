const BookshelfStage = require('../../infrastructure/data/stage');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {
  async findByCampaignId(campaignId) {
    const results = await BookshelfStage.query((qb) => {
      qb.join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId');
      qb.where('campaigns.id', '=', campaignId);
      qb.orderBy('stages.threshold');
    }).fetchAll({ require: false });

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfStage, results);
  },

  findByTargetProfileId(targetProfileId) {
    return BookshelfStage
      .where({ targetProfileId })
      .fetchAll({ require: false })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfStage, results));
  },
};
