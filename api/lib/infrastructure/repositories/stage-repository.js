const BookshelfStage = require('../../infrastructure/data/stage');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const _ = require('lodash');
const { NotFoundError, ObjectValidationError } = require('../../domain/errors');

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

  async updateStagePrescriberAttributes(stage) {
    const { id, prescriberTitle, prescriberDescription } = stage;
    try {
      await new BookshelfStage({ id })
        .save({ prescriberTitle, prescriberDescription }, { patch: true });
    } catch (error) {
      if (error instanceof BookshelfStage.NoRowsUpdatedError) {
        throw new NotFoundError(`Le palier avec l'id ${id} n'existe pas`);
      }
      throw new ObjectValidationError();
    }
  },

  async get(id) {
    const bookshelfStage = await BookshelfStage
      .where('id', id)
      .fetch({ require: true })
      .catch((err) => {
        if (err instanceof BookshelfStage.NotFoundError) {
          throw new NotFoundError(`Not found stage for ID ${id}`);
        }
        throw err;
      });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfStage, bookshelfStage);
  },
};
