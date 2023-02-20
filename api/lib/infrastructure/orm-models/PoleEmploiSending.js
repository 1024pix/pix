import Bookshelf from '../bookshelf';

import './CampaignParticipation';

const modelName = 'PoleEmploiSending';

export default Bookshelf.model(
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
