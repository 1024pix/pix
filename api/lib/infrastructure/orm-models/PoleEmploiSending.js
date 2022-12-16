const Bookshelf = require('../bookshelf');

require('./CampaignParticipation');

const modelName = 'PoleEmploiSending';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'pole-emploi-sendings',
    hasTimestamps: ['createdAt'],

    campaignParticipation() {
      return this.belongsTo('CampaignParticipation', 'campaignParticipationId');
    },
  },
  {
    modelName,
  }
);
