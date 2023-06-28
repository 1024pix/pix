import { Bookshelf } from '../bookshelf.js';

import './CampaignParticipation.js';

const modelName = 'PoleEmploiSending';

const BookshelfPoleEmploiSending = Bookshelf.model(
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

export { BookshelfPoleEmploiSending };
