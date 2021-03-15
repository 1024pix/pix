const BookshelfStage = require('../../infrastructure/data/stage');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const _ = require('lodash');

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
      .orderBy('threshold')
      .fetchAll({ require: false })
      .then((results) => bookshelfToDomainConverter.buildDomainObjects(BookshelfStage, results));
  },

  async create(stage) {
    const stageAttributes = _.pick(stage, [
      'title',
      'message',
      'threshold',
      'targetProfileId',
    ]);
    const createdStage = await (new BookshelfStage(stageAttributes).save());
    return bookshelfToDomainConverter.buildDomainObject(BookshelfStage, createdStage);
  },
};
